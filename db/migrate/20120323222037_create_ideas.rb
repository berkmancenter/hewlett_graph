class CreateIdeas < ActiveRecord::Migration
  def change
    create_table :ideas do |t|
      t.text :content
      t.references :subcategory
      t.references :graph

      t.timestamps
    end
    add_index :ideas, :subcategory_id
    add_index :ideas, :graph_id
  end
end
