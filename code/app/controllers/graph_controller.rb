class GraphController < ApplicationController
    before_filter :load_graph, :except => [:index, :new, :create]
    def index
        @graphs = Graph.all
    end

    def show
    end

    def new
        @graph = Graph.new
    end

    def create
        @graph = Graph.new(params[:graph])
        @graph.import_data_from_attachment!
    end

    def edit
    end

    def update
        @graph.update_attributes(params[:graph])
    end

    def destroy
        @graph.destroy
    end

    def load_graph
        @graph = Graph.find(params[:id])
    end
end
