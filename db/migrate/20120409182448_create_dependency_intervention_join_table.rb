class CreateDependencyInterventionJoinTable < ActiveRecord::Migration
  def change
    create_table :dependencies_interventions, :id => false do |t|
      t.integer :dependency_id
      t.integer :intervention_id
    end
  end
end
