require 'csv'
require 'capybara'
require 'capybara/dsl'
require 'nokogiri'
require 'headless'

class Graph < ActiveRecord::Base
    has_attached_file :data
    has_many :ideas
    has_many :categories, :order => :name
    has_many :stakeholders, :order => :name
    has_many :subcategories, :through => :categories, :order => 'category_id, name'
    has_many :questions
    has_many :idea_types
    acts_as_api

    attr_accessor :sort_attr, :color_attr
    api_accessible :everything do |t|
        t.add :ideas
        t.add :categories
        t.add :subcategories
        t.add :stakeholders
        t.add :days
    end

    api_accessible :prerendered do |t|
        t.add :prerendered_ideas, :as => :ideas
        t.add :categories, :template => :everything
        t.add :subcategories, :template => :everything
        t.add :stakeholders, :template => :everything
        t.add :days, :template => :everything
    end

    api_accessible :hierarchy do |t|
        t.add :name
        t.add lambda{ |graph| graph.class.name.downcase }, :as => :className
        t.add :categories, :as => :children
        t.add :idea_types
    end

    def import_data_from_attachment!
        column_names = Code::Application.config.column_names[:required]

        category_names = table[column_names[:category]].uniq!
        category_names.each do |name|
            categories << Category.new(:name => name)
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
            idea = Idea.new({ :content => row[column_names[:idea]] })
            idea_category = categories.find_by_name(row[column_names[:category]])
            idea_stakeholder_names = row[column_names[:stakeholders]].split(', ')
            if idea_stakeholder_names.include? 'All'
                idea.stakeholders = stakeholders.all
            else 
                idea.stakeholders << stakeholders.find_all_by_name(idea_stakeholder_names)
            end
            idea.subcategory = Subcategory.where(:name => row[column_names[:subcategory]], :category_id => idea_category.id).first_or_initialize
            ideas << idea
        end

        self.save!
    end

    def days_of_ideas
        (ideas.maximum('created_at').to_date - ideas.minimum('created_at').to_date).to_i + 1
    end

    def days
        return (0..days_of_ideas - 1).map{ |i| { :name => (ideas.minimum('created_at').to_date + i.days).strftime('%A') } }
    end

    def prerendered_ideas
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
