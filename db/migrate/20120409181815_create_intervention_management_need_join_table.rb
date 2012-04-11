class CreateInterventionManagementNeedJoinTable < ActiveRecord::Migration
  def change
    create_table :interventions_management_needs, :id => false do |t|
      t.integer :management_need_id
      t.integer :intervention_id
    end
  end
end
