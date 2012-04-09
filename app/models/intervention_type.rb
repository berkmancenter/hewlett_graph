class InterventionType < ActiveRecord::Base
    belongs_to :graph
    has_one :intervention
    acts_as_api

    api_accessible :hierarchy do |t|
        t.add :name
    end
end
