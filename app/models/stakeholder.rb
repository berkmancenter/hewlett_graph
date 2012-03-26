class Stakeholder < ActiveRecord::Base
    has_and_belongs_to_many :ideas
    acts_as_api

    api_accessible :public_ideas do |t|
        t.add :name
    end

    api_accessible :stakeholders do |t|
        t.add :name
    end
end
