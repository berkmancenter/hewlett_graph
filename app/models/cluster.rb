class Cluster < ActiveRecord::Base
    has_many :interventions
    acts_as_api

    api_accessible :everything do |t|
        t.add :uuid
        t.add :name
    end
end
