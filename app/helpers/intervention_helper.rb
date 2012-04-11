module InterventionHelper
    def collection(klass)
        Hash[klass.all.map{ |ob| ["#{ob.name} - #{ob.description}", ob.id] }]
    end
end
