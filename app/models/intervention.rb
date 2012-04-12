class Intervention < ActiveRecord::Base
    has_and_belongs_to_many :implementation_complexities
    has_and_belongs_to_many :contexts
    has_and_belongs_to_many :management_needs
    has_and_belongs_to_many :time_frames
    has_and_belongs_to_many :policy_focii
    has_and_belongs_to_many :coordination_needs
    has_and_belongs_to_many :actors
    has_and_belongs_to_many :dependencies
    has_and_belongs_to_many :financial_requirements
    has_and_belongs_to_many :risks

    belongs_to :subcategory
    belongs_to :graph
    belongs_to :cluster
    has_one :category, :through => :subcategory
    acts_as_api

    validates :title, :subcategory, :cluster, :presence => true

    api_accessible :everything do |t|
        t.add :uuid
        t.add :id
        t.add lambda{|i| i.cluster.id }, :as => :cluster_id 
        t.add :category
        t.add :subcategory
        t.add :title
        t.add :description
        t.add :cluster
        t.add :can_be_implemented_by_existing_orgs
        t.add :requires_new_coop_of_existing_orgs
        t.add :requires_expanded_coop_of_existing_org
        t.add :requires_new_orgs
        t.add :hackable
        t.add :facilitates_sustainability
        t.add :facilitates_reusability
        t.add :has_translation_component
        t.add :has_legal_or_policy_changes
        t.add :facilitates_feedback
        t.add :promotes_interop
        t.add :promotes_access
        t.add :promotes_discovery
        t.add :increases_adoption
        t.add :engages_nontraditional
        t.add :focuses_on_community
        t.add :requires_public_outreach
        t.add :likely_to_face_opposition
        t.add :requires_culture_shift
        t.add :supports_data_collection
        t.add :requires_more_research
        t.add :required_innovations
        t.add :additional_info
        t.add :implementation_complexities
        t.add :contexts
        t.add :management_needs
        t.add :time_frames
        t.add :policy_focii
        t.add :coordination_needs
        t.add :actors
        t.add :dependencies
        t.add :financial_requirements
        t.add :risks
    end

    api_accessible :hierarchy do |t|
        t.add :title
        t.add :description
    end

    def day
        value = 0
        first_day = graph.interventions.minimum('created_at').to_date.to_time
        graph.days_of_interventions.times do |i|
            value = i if created_at.between?(first_day + i.days, first_day + (i + 1).days - 1.second)
        end
        return { :name => created_at.strftime('%A'), :value => value }
    end
end
