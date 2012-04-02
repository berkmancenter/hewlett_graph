class Subcategory < ActiveRecord::Base
    belongs_to :category
    acts_as_api

    api_accessible :everything do |t|
        t.add :name
        t.add :category_name
    end

    api_accessible :just_name do |t|
        t.add :name
    end

    def category_name
        category.name
    end
end
