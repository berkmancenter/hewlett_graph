class Category < ActiveRecord::Base
    belongs_to :graph
    has_many :subcategories, :order => :name
    acts_as_api

    api_accessible :everything do |t|
        t.add :uuid
        t.add :name
        t.add :subcategory_uuids
    end

    api_accessible :hierarchy do |t|
        t.add :name
        t.add :subcategories, :as => :children
    end

    def subcategory_uuids
        return subcategories.map { |subcategory| subcategory.uuid }
    end
end
