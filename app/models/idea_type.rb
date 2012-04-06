class IdeaType < ActiveRecord::Base
    belongs_to :graph
    has_one :idea
end
