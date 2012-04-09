class CreateInterventionPolicyFocusJoinTable < ActiveRecord::Migration
  def change
    create_table :interventions_policy_focii, :id => false do |t|
      t.integer :policy_focus_id
      t.integer :intervention_id
    end
  end
end
