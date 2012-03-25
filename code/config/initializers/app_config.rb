Code::Application.configure do

    # These are the names that the header columns in the data CSVs should take
    # if we want them to get picked up automatically.
    config.column_names = {
        :required => {
            :category => 'Category',
            :subcategory => 'Subcategory',
            :stakeholder => 'Stakeholder',
            :idea => 'Idea'
        }
    }
end
