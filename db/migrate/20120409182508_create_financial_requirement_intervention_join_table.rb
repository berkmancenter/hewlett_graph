class CreateFinancialRequirementInterventionJoinTable < ActiveRecord::Migration
  def change
    create_table :financial_requirements_interventions, :id => false do |t|
      t.integer :financial_requirement_id
      t.integer :intervention_id
    end
  end
end
