# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120411023307) do

  create_table "actors", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "actors_interventions", :id => false, :force => true do |t|
    t.integer "actor_id"
    t.integer "intervention_id"
  end

  create_table "categories", :force => true do |t|
    t.string   "name"
    t.integer  "graph_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "categories", ["graph_id"], :name => "index_categories_on_graph_id"

  create_table "clusters", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "contexts", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "contexts_interventions", :id => false, :force => true do |t|
    t.integer "context_id"
    t.integer "intervention_id"
  end

  create_table "coordination_needs", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "coordination_needs_interventions", :id => false, :force => true do |t|
    t.integer "coordination_need_id"
    t.integer "intervention_id"
  end

  create_table "dependencies", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "dependencies_interventions", :id => false, :force => true do |t|
    t.integer "dependency_id"
    t.integer "intervention_id"
  end

  create_table "financial_requirements", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "financial_requirements_interventions", :id => false, :force => true do |t|
    t.integer "financial_requirement_id"
    t.integer "intervention_id"
  end

  create_table "graphs", :force => true do |t|
    t.string   "name"
    t.string   "data_file_name"
    t.string   "data_content_type"
    t.integer  "data_file_size"
    t.datetime "data_updated_at"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
  end

  create_table "implementation_complexities", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "implementation_complexities_interventions", :id => false, :force => true do |t|
    t.integer "implementation_complexity_id"
    t.integer "intervention_id"
  end

  create_table "intervention_types", :force => true do |t|
    t.string   "name"
    t.integer  "graph_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "interventions", :force => true do |t|
    t.string   "title"
    t.text     "description"
    t.boolean  "can_be_implemented_by_existing_orgs"
    t.boolean  "requires_new_coop_of_existing_orgs"
    t.boolean  "requires_expanded_coop_of_existing_org"
    t.boolean  "requires_new_orgs"
    t.boolean  "hackable"
    t.boolean  "facilitates_sustainability"
    t.boolean  "facilitates_reusability"
    t.boolean  "has_translation_component"
    t.boolean  "has_legal_or_policy_changes"
    t.boolean  "facilitates_feedback"
    t.boolean  "promotes_interop"
    t.boolean  "promotes_access"
    t.boolean  "promotes_discovery"
    t.boolean  "increases_adoption"
    t.boolean  "engages_nontraditional"
    t.boolean  "focuses_on_community"
    t.boolean  "requires_public_outreach"
    t.boolean  "likely_to_face_opposition"
    t.boolean  "requires_culture_shift"
    t.boolean  "supports_data_collection"
    t.boolean  "requires_more_research"
    t.text     "required_innovations"
    t.text     "additional_info"
    t.integer  "subcategory_id"
    t.integer  "graph_id"
    t.integer  "cluster_id"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  add_index "interventions", ["graph_id"], :name => "index_interventions_on_graph_id"
  add_index "interventions", ["subcategory_id"], :name => "index_interventions_on_subcategory_id"

  create_table "interventions_management_needs", :id => false, :force => true do |t|
    t.integer "management_need_id"
    t.integer "intervention_id"
  end

  create_table "interventions_policy_focii", :id => false, :force => true do |t|
    t.integer "policy_focus_id"
    t.integer "intervention_id"
  end

  create_table "interventions_risks", :id => false, :force => true do |t|
    t.integer "risk_id"
    t.integer "intervention_id"
  end

  create_table "interventions_stakeholders", :id => false, :force => true do |t|
    t.integer "intervention_id"
    t.integer "stakeholder_id"
  end

  create_table "interventions_time_frames", :id => false, :force => true do |t|
    t.integer "time_frame_id"
    t.integer "intervention_id"
  end

  create_table "management_needs", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "policy_focii", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "questions", :force => true do |t|
    t.integer  "graph_id"
    t.text     "content",                                     :null => false
    t.string   "sort_by",                                     :null => false
    t.string   "color_by",                                    :null => false
    t.boolean  "hide_labels",              :default => false
    t.integer  "selected_intervention_id"
    t.datetime "created_at",                                  :null => false
    t.datetime "updated_at",                                  :null => false
  end

  create_table "risks", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "stakeholders", :force => true do |t|
    t.string   "name"
    t.integer  "graph_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "stakeholders", ["graph_id"], :name => "index_stakeholders_on_graph_id"

  create_table "subcategories", :force => true do |t|
    t.integer  "category_id"
    t.string   "name"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "subcategories", ["category_id"], :name => "index_subcategories_on_category_id"

  create_table "time_frames", :force => true do |t|
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

end
