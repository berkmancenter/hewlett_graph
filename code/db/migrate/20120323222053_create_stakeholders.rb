class CreateStakeholders < ActiveRecord::Migration
  def change
    create_table :stakeholders do |t|
      t.string :name
      t.references :graph

      t.timestamps
    end
    add_index :stakeholders, :graph_id
  end
end
