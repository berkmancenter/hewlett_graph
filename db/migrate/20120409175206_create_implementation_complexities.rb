class CreateImplementationComplexities < ActiveRecord::Migration
  def change
    create_table :implementation_complexities do |t|
      t.string :name
      t.string :description

      t.timestamps
    end
  end
end
