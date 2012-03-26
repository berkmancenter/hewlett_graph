class Subcategory < ActiveRecord::Base
    belongs_to :category
    acts_as_api

    api_accessible :public_ideas do |t|
        t.add :name
    end

    api_accessible :categories do |t|
        t.add :name
    end
end
