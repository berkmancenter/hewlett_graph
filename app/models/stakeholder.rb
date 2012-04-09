class Stakeholder < ActiveRecord::Base
    has_and_belongs_to_many :interventions
    acts_as_api

    api_accessible :everything do |t|
        t.add :uuid
        t.add :name
    end

    api_accessible :hierarchy do |t|
        t.add :name
    end
end
