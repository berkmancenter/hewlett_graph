class CreateCoordinationNeeds < ActiveRecord::Migration
  def change
    create_table :coordination_needs do |t|
      t.string :name
      t.string :description

      t.timestamps
    end
  end
end
