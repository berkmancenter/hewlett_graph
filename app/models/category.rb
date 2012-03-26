class Category < ActiveRecord::Base
    belongs_to :graph
    has_many :subcategories
    acts_as_api

    api_accessible :public_ideas do |t|
        t.add :name
    end

    api_accessible :categories do |t|
        t.add :name
        t.add :subcategories
    end
end
