class CreateQuestions < ActiveRecord::Migration
  def change
    create_table :questions do |t|
      t.references :graph
      t.text :content, :null => false
      t.string :sort_by, :null => false
      t.string :color_by, :null => false
      t.boolean :hide_labels, :default => false
      t.integer :selected_intervention_id

      t.timestamps
    end
  end
end
