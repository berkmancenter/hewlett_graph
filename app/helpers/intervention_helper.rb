module InterventionHelper
    def collection(klass)
        Hash[klass.all.map{ |ob| [if ob.description then "#{ob.name} - #{ob.description}" else ob.name end, ob.id] }]
    end
end
