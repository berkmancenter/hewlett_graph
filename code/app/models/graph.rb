require 'csv'

class Graph < ActiveRecord::Base
    has_attached_file :data
    has_many :ideas
    has_many :categories
    has_many :stakeholders
    has_many :subcategories, :through => :categories
    acts_as_api

    api_accessible :all do |t|
        t.add :ideas, :template => :public_ideas
        t.add :categories, :template => :categories
        t.add :subcategories, :template => :categories
        t.add :stakeholders, :template => :stakeholders
    end

    api_accessible :public_ideas do |t|
        t.add :ideas
    end

    api_accessible :categories do |t|
        t.add :categories
    end

    api_accessible :stakeholders do |t|
        t.add :stakeholders
    end

    def import_data_from_attachment!
        column_names = Code::Application.config.column_names[:required]

        category_names = table[column_names[:category]].uniq!
        categories << Category.create(category_names.map { |c| { :name => c } })

        stakeholder_names = table[column_names[:stakeholder]].uniq!.map{ |n| n.split(', ') }.flatten!.uniq!.delete_if{ |n| n == 'All' }
        logger.debug(stakeholder_names.inspect)
        stakeholders << Stakeholder.create(stakeholder_names.map { |s| { :name => s } })

        table.each do |row|
            idea = Idea.new({ :content => row['Idea'] })
            idea_category = categories.find_by_name(row[column_names[:category]])
            idea_stakeholder_names = row['Stakeholder'].split(', ')
            if idea_stakeholder_names.include? 'All'
                idea.stakeholders = stakeholders.all
            else 
                idea.stakeholders << stakeholders.find_all_by_name(idea_stakeholder_names)
            end
            if idea.stakeholders.empty?
                logger.debug('content: ' + idea_stakeholder_names.inspect)
            end
            idea.subcategory = Subcategory.where(:name => row[column_names[:subcategory]], :category_id => idea_category.id).first_or_initialize
            if idea.subcategory.new_record?
                idea.subcategory.category = idea_category
            end
            ideas << idea
        end

        self.save!
    end

    protected
    def table
        if data.exists?
            CSV.read(data.path, :headers => true)
        else
            CSV.read(data.uploaded_file.tempfile.path, :headers => true)
        end
    end
end
