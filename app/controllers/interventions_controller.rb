class InterventionsController < ApplicationController
    before_filter :load_intervention, :except => [:index, :new, :create]
    before_filter :load_graph

    def index
        @interventions = Intervention.all
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

    def load_graph
        @graph = Graph.find(params[:graph_id])
    end
end
