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

ActiveRecord::Schema.define(:version => 20120324031923) do

  create_table "categories", :force => true do |t|
    t.string   "name"
    t.integer  "graph_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "categories", ["graph_id"], :name => "index_categories_on_graph_id"

  create_table "graphs", :force => true do |t|
    t.string   "name"
    t.string   "data_file_name"
    t.string   "data_content_type"
    t.integer  "data_file_size"
    t.datetime "data_updated_at"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
  end

  create_table "ideas", :force => true do |t|
    t.text     "content"
    t.integer  "subcategory_id"
    t.integer  "graph_id"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
  end

  add_index "ideas", ["graph_id"], :name => "index_ideas_on_graph_id"
  add_index "ideas", ["subcategory_id"], :name => "index_ideas_on_subcategory_id"

  create_table "ideas_stakeholders", :id => false, :force => true do |t|
    t.integer "idea_id"
    t.integer "stakeholder_id"
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

end
