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
        :content => 'Which categories have received the most attention?',
        :sort_by => 'category',
        :color_by => 'category',
        :hide_labels => true
    },
    {
        :graph_id => 1,
        :content => 'Which subcategories have received the most attention?',
        :sort_by => 'subcategory',
        :color_by => 'subcategory',
        :hide_labels => true
    },
    {
        :graph_id => 1,
        :content => 'Which categories are most interesting to Facilitators, Builders, or Learners?',
        :sort_by => 'stakeholders',
        :color_by => 'category'
    }
])


