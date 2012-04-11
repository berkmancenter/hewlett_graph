# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
#Question.create([
#    {
#        :graph_id => 1,
#        :content => 'Which subcategories have received the most attention?',
#        :sort_by => 'subcategory',
#        :color_by => 'subcategory',
#        :hide_labels => true
#    },
#    {
#        :graph_id => 1,
#        :content => 'What categories are more interesting to Facilitators than to Builders?',
#        :sort_by => 'stakeholders',
#        :color_by => 'category'
#    },
#    {
#        :graph_id => 1,
#        :content => 'What does an "intervention" consist of?',
#        :sort_by => 'category',
#        :color_by => 'category',
#        :selected_intervention_id => 1
#    }
#])
graph = Graph.create(:name => 'OER Interventions')
graph.categories << Category.create([
    {
        :name => 'Micro',
        :subcategories => Subcategory.create([
            { :name => 'Learning & Teaching' },
            { :name => 'Guidance/Training/Mentoring' },
            { :name => 'Customization/Reuse/Remix' },
            { :name => 'Business & Sustainability Models' }
        ]) 
    },
    {
        :name => 'Meso',
        :subcategories => Subcategory.create([
            { :name => 'Accessibility' },
            { :name => 'Tools & Technology' },
            { :name => 'Search & Discoverability Mechanisms' },
            { :name => 'Quality Control' },
            { :name => 'Accreditation' },
            { :name => 'Feedback Mechanisms' }
        ]) 
    },
    {
        :name => 'Macro',
        :subcategories => Subcategory.create([
            { :name => 'Supportive Policies' },
            { :name => 'Copyright & Licensing' },
            { :name => 'Community Building' },
            { :name => 'Lobbying' }
        ]) 
    },
    {
        :name => 'Research',
        :subcategories => Subcategory.create([
            { :name => 'Impact Assessments' },
            { :name => 'Evidence Gathering & Sharing' },
            { :name => 'Case Studies' }
        ]) 
    }
])
Context.create([
    { :name => 'Formal Learning' },
    { :name => 'Informal Learning' },
    { :name => 'National' },
    { :name => 'Multinational' }
])
Actor.create([
    { :name => 'Content Creators' },
    { :name => 'End Users' },
    { :name => 'Facilitators/Intermediaries' },
    { :name => 'Researchers' },
    { :name => 'Policy Makers' }
])
TimeFrame.create([
    { :name => 'Short-term', :description => 'reaches maturity in less than one year' },
    { :name => 'Medium-term', :description => 'reaches maturity in 2-4 years' },
    { :name => 'Long-term', :description => 'reaches maturity in more than 4 years' }
])
ManagementNeed.create([
    { :name => 'Low', :description => 'little additional effort to maintain' },
    { :name => 'Medium', :description => 'significant ongoing effort required to maintain' },
    { :name => 'High', :description => 'intensive effort to maintain' }
])
PolicyFocus.create([
    { :name => 'Institutional Level' },
    { :name => 'National' },
    { :name => 'Global' }
])
FinancialRequirement.create([
    { :name => 'Low', :description => 'can be implemented with little or no additional funding' },
    { :name => 'Medium', :description => 'less than 100k per year' },
    { :name => 'High', :description => 'less than 100k per year' }
])
CoordinationNeed.create([
    { :name => 'Low', :description => 'able to launch without recruiting other participants' },
    { :name => 'Medium', :description => 'requires coordination and buy-in of several organizations' },
    { :name => 'High', :description => 'requires broad coordination/buy-in' }
])
Dependency.create([
    { :name => 'Low', :description => 'stand alone intervention that requires no complementary efforts' },
    { :name => 'Medium', :description => 'depends on another change/intervention' },
    { :name => 'High', :description => 'depends on several other complementary interventions/changes' }
])
Risk.create([
    { :name => 'Low', :description => 'results are predictable' },
    { :name => 'Medium', :description => 'reasonable degree of predictability' },
    { :name => 'High', :description => 'results are unpredictable' }
])
ImplementationComplexity.create([
    { :name => 'Low', :description => 'easy to implement' },
    { :name => 'Medium', :description => 'reasonable to implement' },
    { :name => 'High', :description => 'it is complicated' }
])
Cluster.create(("A".."S").map{ |l| { :name => l }});
