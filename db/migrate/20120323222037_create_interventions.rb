class CreateInterventions < ActiveRecord::Migration
  def change
    create_table :interventions do |t|
      t.string :title
      t.text :description

      t.boolean :can_be_implemented_by_existing_orgs
      t.boolean :requires_new_coop_of_existing_orgs
      t.boolean :requires_expanded_coop_of_existing_org
      t.boolean :requires_new_orgs
      t.boolean :hackable
      t.boolean :facilitates_sustainability
      t.boolean :facilitates_reusability
      t.boolean :has_translation_component
      t.boolean :has_legal_or_policy_changes
      t.boolean :facilitates_feedback
      t.boolean :promotes_interop
      t.boolean :promotes_access
      t.boolean :promotes_discovery
      t.boolean :increases_adoption
      t.boolean :engages_nontraditional
      t.boolean :focuses_on_community
      t.boolean :requires_public_outreach
      t.boolean :likely_to_face_opposition
      t.boolean :requires_culture_shift
      t.boolean :supports_data_collection
      t.boolean :requires_more_research
      t.text :required_innovations
      t.text :additional_info

      t.references :subcategory
      t.references :graph
      t.references :intervention_type

      t.timestamps
    end
    add_index :interventions, :subcategory_id
    add_index :interventions, :graph_id
  end
end
