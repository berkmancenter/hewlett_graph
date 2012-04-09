class CreateDependencies < ActiveRecord::Migration
  def change
    create_table :dependencies do |t|

      t.timestamps
    end
  end
end
