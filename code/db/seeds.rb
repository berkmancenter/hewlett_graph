# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
Stakeholder.create([{ :name => 'Learner' }, { :name => 'Facilitator' }, { :name => 'Builder' }])
Category.create([
    {
        :name => 'Micro',
        :subcategories => Subcategory.create([{ :name => 'Accessibility' }, { :name => 'Teaching & Learning' }])
    },
    {
        :name => 'Meso',
        :subcategories => Subcategory.create([{ :name => 'Tools & Technology' }, { :name => 'Copyright & Licensing' }])
    },
    {
        :name => 'Macro',
        :subcategories => Subcategory.create([{ :name => 'Policy' }, { :name => 'Community Building' }])
    },
    {
        :name => 'Research & Metrics',
        :subcategories => Subcategory.create([{ :name => 'Quality Control' }, { :name => 'Assessment' }])
    }
])
