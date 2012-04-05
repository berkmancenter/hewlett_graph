class Stakeholder < ActiveRecord::Base
    has_and_belongs_to_many :ideas
    acts_as_api

    api_accessible :everything do |t|
        t.add :uuid
        t.add :name
    end
end
