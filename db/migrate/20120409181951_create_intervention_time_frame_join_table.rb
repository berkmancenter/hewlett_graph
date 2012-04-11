class CreateInterventionTimeFrameJoinTable < ActiveRecord::Migration
  def change
    create_table :interventions_time_frames, :id => false do |t|
      t.integer :time_frame_id
      t.integer :intervention_id
    end
  end
end
