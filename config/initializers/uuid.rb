module JDCC
    module ActiveRecord
        module Base
            def uuid
                self.class.name.downcase + '-' + self.id.to_s
            end
        end
    end
end

class ActiveRecord::Base
    include JDCC::ActiveRecord::Base
end
