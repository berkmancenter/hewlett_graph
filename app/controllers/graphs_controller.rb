class GraphsController < ApplicationController
    before_filter :load_graph, :except => [:index, :new, :create]

    def index
        @graphs = Graph.all
    end

    def show
        respond_to do |format|
            format.html
            format.json { render_for_api :all, :json => @graph }
        end
    end

    def categories
        respond_to do |format|
            format.json { render_for_api :categories, :json => @graph }
        end
    end

    def ideas
        respond_to do |format|
            format.json { render_for_api :public_ideas, :json => @graph }
        end
    end

    def stakeholders
        respond_to do |format|
            format.json { render_for_api :stakeholders, :json => @graph }
        end
    end

    def new
        @graph = Graph.new
    end

    def create
        @graph = Graph.new(params[:graph])
        @graph.import_data_from_attachment!
        redirect_to graphs_path
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
