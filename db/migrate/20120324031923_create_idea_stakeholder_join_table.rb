class CreateIdeaStakeholderJoinTable < ActiveRecord::Migration
    def change
    create_table :ideas_stakeholders, :id => false do |t|
      t.integer :idea_id
      t.integer :stakeholder_id
    end
  end
end
