class Idea < ActiveRecord::Base
    has_and_belongs_to_many :stakeholders
    belongs_to :subcategory
    belongs_to :graph
    has_one :category, :through => :subcategory
    acts_as_api

    api_accessible :everything do |t|
        t.add :category
        t.add :subcategory
        t.add :stakeholders
        t.add :content
        t.add :day
    end

    def day
        value = 0
        first_day = graph.ideas.minimum('created_at').to_date.to_time
        graph.days_of_ideas.times do |i|
            value = i if created_at.between?(first_day + i.days, first_day + (i + 1).days - 1.second)
        end
        return { :name => created_at.strftime('%A'), :value => value }
    end
end
