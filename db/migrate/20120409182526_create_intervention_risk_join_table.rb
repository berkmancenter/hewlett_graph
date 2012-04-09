class CreateInterventionRiskJoinTable < ActiveRecord::Migration
  def change
    create_table :interventions_risks, :id => false do |t|
      t.integer :risk_id
      t.integer :intervention_id
    end
  end
end
