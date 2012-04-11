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
        t.add :category
        t.add :subcategory
        t.add :title
        t.add :description
    end

    api_accessible :hierarchy do |t|
        t.add :title
        t.add :description
        t.add :intervention_type
        t.add :stakeholders
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
