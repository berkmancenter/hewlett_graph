class Idea < ActiveRecord::Base
    has_and_belongs_to_many :stakeholders
    belongs_to :subcategory
    belongs_to :graph
    has_one :category, :through => :subcategory
    acts_as_api

    api_accessible :public_ideas do |t|
        t.add :category
        t.add :subcategory
        t.add :stakeholders
        t.add :content
    end
end
