class FinancialRequirement < ActiveRecord::Base
    acts_as_api

    api_accessible :everything do |t|
        t.add :uuid
        t.add :name
        t.add :description
    end
end
