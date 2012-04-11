class CreateManagementNeeds < ActiveRecord::Migration
  def change
    create_table :management_needs do |t|
      t.string :name
      t.string :description

      t.timestamps
    end
  end
end
