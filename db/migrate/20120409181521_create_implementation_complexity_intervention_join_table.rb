class CreateImplementationComplexityInterventionJoinTable < ActiveRecord::Migration
  def change
    create_table :implementation_complexities_interventions, :id => false do |t|
      t.integer :implementation_complexity_id
      t.integer :intervention_id
    end
  end
end
