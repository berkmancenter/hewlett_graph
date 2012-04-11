class InterventionsController < ApplicationController
    before_filter :load_intervention, :except => [:index, :new, :create]
    before_filter :load_cluster

    def index
        @interventions = @cluster.interventions.all
    end

    def show
    end

    def new
        @intervention = Intervention.new
    end

    def edit
    end

    def update
    end

    def create
    end

    def destroy
    end

    def load_intervention
        @intervention = Intervention.find(params[:id])
    end

    def load_cluster
        @cluster = Cluster.find(params[:cluster_id])
    end
end
