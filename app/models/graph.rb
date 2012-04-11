require 'csv'
require 'capybara'
require 'capybara/dsl'
require 'nokogiri'
require 'headless'

class Graph < ActiveRecord::Base
    has_attached_file :data
    has_many :interventions
    has_many :categories, :order => :name
    has_many :stakeholders, :order => :name
    has_many :subcategories, :through => :categories, :order => 'category_id, name'
    has_many :questions
    acts_as_api

    attr_accessor :sort_attr, :color_attr
    api_accessible :everything do |t|
        t.add :interventions
        t.add :categories
        t.add :subcategories
        t.add lambda{|g| ImplementationComplexity.all }, :as => :implementation_complexities
        t.add lambda{|g| Cluster.all }, :as => :cluster
        t.add lambda{|g| Context.all }, :as => :contexts
        t.add lambda{|g| ManagementNeed.all }, :as => :management_needs
        t.add lambda{|g| TimeFrame.all }, :as => :time_frames
        t.add lambda{|g| PolicyFocus.all }, :as => :policy_focii
        t.add lambda{|g| CoordinationNeed.all }, :as => :coordination_needs
        t.add lambda{|g| Actor.all }, :as => :actors
        t.add lambda{|g| Dependency.all }, :as => :dependencies
        t.add lambda{|g| FinancialRequirement.all }, :as => :financial_requirements
        t.add lambda{|g| Risk.all }, :as => :risks
        t.add lambda{|g| [true, false] }, :as => :can_be_implemented_by_existing_orgs
        t.add lambda{|g| [true, false] }, :as => :requires_new_coop_of_existing_orgs
        t.add lambda{|g| [true, false] }, :as => :requires_expanded_coop_of_existing_org
        t.add lambda{|g| [true, false] }, :as => :requires_new_orgs
        t.add lambda{|g| [true, false] }, :as => :hackable
        t.add lambda{|g| [true, false] }, :as => :facilitates_sustainability
        t.add lambda{|g| [true, false] }, :as => :facilitates_reusability
        t.add lambda{|g| [true, false] }, :as => :has_translation_component
        t.add lambda{|g| [true, false] }, :as => :has_legal_or_policy_changes
        t.add lambda{|g| [true, false] }, :as => :facilitates_feedback
        t.add lambda{|g| [true, false] }, :as => :promotes_interop
        t.add lambda{|g| [true, false] }, :as => :promotes_access
        t.add lambda{|g| [true, false] }, :as => :promotes_discovery
        t.add lambda{|g| [true, false] }, :as => :increases_adoption
        t.add lambda{|g| [true, false] }, :as => :engages_nontraditional
        t.add lambda{|g| [true, false] }, :as => :focuses_on_community
        t.add lambda{|g| [true, false] }, :as => :requires_public_outreach
        t.add lambda{|g| [true, false] }, :as => :likely_to_face_opposition
        t.add lambda{|g| [true, false] }, :as => :requires_culture_shift
        t.add lambda{|g| [true, false] }, :as => :supports_data_collection
        t.add lambda{|g| [true, false] }, :as => :requires_more_research
    end

    api_accessible :prerendered do |t|
        t.add :prerendered_interventions, :as => :interventions
        t.add :categories, :template => :everything
        t.add :subcategories, :template => :everything
        t.add :stakeholders, :template => :everything
        t.add :days, :template => :everything
    end

    api_accessible :hierarchy do |t|
        t.add :name
        t.add lambda{ |graph| graph.class.name.downcase }, :as => :className
        t.add :categories, :as => :children
        t.add :intervention_types
    end

    def import_data_from_attachment!
        column_names = Code::Application.config.column_names[:required]

        category_names = table[column_names[:category]].uniq!
        category_names.each do |name|
            categories << Category.new(:name => name)
        end

        type_names = table[column_names[:type]].uniq!
        type_names.each do |name|
            intervention_types << InterventionType.new(:name => name)
        end

        stakeholder_names = table[column_names[:stakeholders]].uniq!.map{ |n| n.split(', ') }.flatten!.uniq!.delete_if{ |n| n == 'All' }
        stakeholder_names.each do |name|
            stakeholders << Stakeholder.new(:name => name)
        end

        self.save!

        update_data_from_attachment!
    end

    def update_data_from_attachment!
        column_names = Code::Application.config.column_names[:required]

        table.each do |row|
            intervention = Intervention.new({ :content => row[column_names[:intervention]] })
            intervention_category = categories.find_by_name(row[column_names[:category]])
            intervention_type = intervention_types.find_by_name(row[column_names[:type]])
            intervention_stakeholder_names = row[column_names[:stakeholders]].split(', ')
            if intervention_stakeholder_names.include? 'All'
                intervention.stakeholders = stakeholders.all
            else 
                intervention.stakeholders << stakeholders.find_all_by_name(intervention_stakeholder_names)
            end
            intervention.subcategory = Subcategory.where(:name => row[column_names[:subcategory]], :category_id => intervention_category.id).first_or_initialize
            intervention.intervention_type = intervention_type
            interventions << intervention
        end

        self.save!
    end

    def days_of_interventions
        (interventions.maximum('created_at').to_date - interventions.minimum('created_at').to_date).to_i + 1
    end

    def days
        return (0..days_of_interventions - 1).map{ |i| { :name => (interventions.minimum('created_at').to_date + i.days).strftime('%A') } }
    end

    def prerendered_interventions
        Capybara.default_driver = :webkit
        Capybara.default_wait_time = 20
        Capybara.app_host = 'http://localhost:3000' 
        cache = ActiveSupport::Cache::FileStore.new Rails.public_path

        key = [id, sort_attr, color_attr]
        if cache.exist?(key)
            return JSON(cache.read(key))
        else
            Headless.ly({ :dimensions => '800x600x24'}) do |headless|
                session = Capybara::Session.new(:webkit)
                session.visit( Rails.application.routes.url_helpers.graph_path(self, :sort_attr => sort_attr, :color_attr => color_attr, :browser_speed => :serverside) )
                session.find('#d3Nodes')
                text = Nokogiri::HTML.parse(session.html).css('#d3Nodes').first.inner_text
                cache.write(key, text)
                return JSON(text)
            end
        end
    end

    protected
    def table
        if data.exists?
            CSV.read(data.path, :headers => true)
        else
            CSV.read(data.uploaded_file.tempfile.path, :headers => true)
        end
    end

    def link_hash(source, target)
        { :source => source.uuid, :target => target.uuid }
    end
end
