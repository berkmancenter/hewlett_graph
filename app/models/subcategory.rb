class Subcategory < ActiveRecord::Base
    belongs_to :category
    acts_as_api

    api_accessible :everything do |t|
        t.add :uuid
        t.add :name
        t.add :category_uuid
    end

    def category_uuid
        category.uuid
    end
end
