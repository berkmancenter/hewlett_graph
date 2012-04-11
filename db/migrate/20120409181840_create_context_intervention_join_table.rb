class CreateContextInterventionJoinTable < ActiveRecord::Migration
  def change
    create_table :contexts_interventions, :id => false do |t|
      t.integer :context_id
      t.integer :intervention_id
    end
  end
end
