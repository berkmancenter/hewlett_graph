class InterventionsController < ApplicationController
    before_filter :load_intervention, :except => [:index, :new, :create]
    before_filter :load_cluster

    def index
        @interventions = @cluster.interventions.all
    end

    def show
    end

    def new
        @intervention = @cluster.interventions.new
    end

    def edit
    end

    def update
        if @intervention.update_attributes(params[:intervention])
            redirect_to cluster_interventions_path(@cluster), :notice => 'Intervention successfully updated!'
        else
            render :action => "edit"
        end
    end

    def create
        @intervention = @cluster.interventions.new(params[:intervention])
        if @intervention.save
            redirect_to cluster_interventions_path(@cluster), :notice => 'Intervention successfully created!'
        else
            render :action => 'new'
        end
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
