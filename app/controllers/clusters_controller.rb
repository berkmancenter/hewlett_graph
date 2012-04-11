class ClustersController < ApplicationController
    before_filter :load_cluster, :except => [:index, :new, :create]

    def index
        @clusters = Cluster.all
    end

    def show
    end

    def load_cluster
        @cluster = Cluster.find(params[:id])
    end
end
