class CreateIdeaTypes < ActiveRecord::Migration
  def change
    create_table :idea_types do |t|
      t.string :name
      t.references :graph

      t.timestamps
    end
  end
end
