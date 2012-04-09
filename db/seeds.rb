# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
Question.create([
    {
        :graph_id => 1,
        :content => 'Which subcategories have received the most attention?',
        :sort_by => 'subcategory',
        :color_by => 'subcategory',
        :hide_labels => true
    },
    {
        :graph_id => 1,
        :content => 'What categories are more interesting to Facilitators than to Builders?',
        :sort_by => 'stakeholders',
        :color_by => 'category'
    },
    {
        :graph_id => 1,
        :content => 'What does an "intervention" consist of?',
        :sort_by => 'category',
        :color_by => 'category',
        :selected_intervention_id => 1
    }
])


