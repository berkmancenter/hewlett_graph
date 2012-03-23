class Idea < ActiveRecord::Base
    has_and_belongs_to_many :stakeholders
    belongs_to :subcategory
    belongs_to :graph
    has_one :category, :through => :subcategory
end
