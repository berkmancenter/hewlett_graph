class CreatePolicyFocii < ActiveRecord::Migration
  def change
    create_table :policy_focii do |t|
      t.string :name
      t.string :description

      t.timestamps
    end
  end
end
