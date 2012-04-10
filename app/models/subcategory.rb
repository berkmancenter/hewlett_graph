class Subcategory < ActiveRecord::Base
    belongs_to :category
    has_many :ideas
    acts_as_api

    api_accessible :everything do |t|
        t.add :uuid
        t.add :name
        t.add :category_uuid
    end

    api_accessible :hierarchy do |t|
        t.add :name
        t.add lambda{ |graph| graph.class.name.downcase }, :as => :className
        t.add :ideas, :as => :children
    end

    def category_uuid
        category.uuid
    end
end
