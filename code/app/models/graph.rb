class Graph < ActiveRecord::Base

    def import_data_from_attachment!
        table.each do |row|

            stakeholder = Stakeholder.find_by_name(row[
            ideas << Idea.new({ :content => row['Quote'] }
        end
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
