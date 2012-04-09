class CreateFinancialRequirements < ActiveRecord::Migration
  def change
    create_table :financial_requirements do |t|
      t.string :name
      t.string :description

      t.timestamps
    end
  end
end
