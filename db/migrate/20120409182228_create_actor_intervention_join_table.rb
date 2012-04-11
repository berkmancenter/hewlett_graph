class CreateActorInterventionJoinTable < ActiveRecord::Migration
  def change
    create_table :actors_interventions, :id => false do |t|
      t.integer :actor_id
      t.integer :intervention_id
    end
  end
end
