class Category < ActiveRecord::Base
    belongs_to :graph
    has_many :subcategories, :order => :name
    acts_as_api

    api_accessible :everything do |t|
        t.add :name
        t.add :subcategories, :template => :just_name
    end
end
