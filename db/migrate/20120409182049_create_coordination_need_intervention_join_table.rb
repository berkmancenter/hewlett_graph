class CreateCoordinationNeedInterventionJoinTable < ActiveRecord::Migration
  def change
    create_table :coordination_needs_interventions, :id => false do |t|
      t.integer :coordination_need_id
      t.integer :intervention_id
    end
  end
end
