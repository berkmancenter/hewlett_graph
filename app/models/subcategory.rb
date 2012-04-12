class Subcategory < ActiveRecord::Base
    belongs_to :category
    has_many :interventions
    acts_as_api

    api_accessible :everything do |t|
        t.add :uuid
        t.add :name
        t.add :category_uuid
    end

    api_accessible :hierarchy do |t|
        t.add :name
        t.add lambda{ |sc| sc.class.name.downcase }, :as => :className
        t.add :interventions, :as => :children
    end

    def category_uuid
        category.uuid
    end
end
