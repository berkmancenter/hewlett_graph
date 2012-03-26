class CreateGraphs < ActiveRecord::Migration
  def up
    create_table :graphs do |t|
      t.string :name
      t.has_attached_file :data

      t.timestamps
    end
  end

  def down
    drop_attached_file :graphs, :data
    drop_table :graphs
  end
end
