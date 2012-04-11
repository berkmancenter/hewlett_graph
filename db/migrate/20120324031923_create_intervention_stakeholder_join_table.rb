class CreateInterventionStakeholderJoinTable < ActiveRecord::Migration
    def change
    create_table :interventions_stakeholders, :id => false do |t|
      t.integer :intervention_id
      t.integer :stakeholder_id
    end
  end
end
