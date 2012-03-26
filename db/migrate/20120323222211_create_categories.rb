class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories do |t|
      t.string :name
      t.references :graph

      t.timestamps
    end
    add_index :categories, :graph_id
  end
end
