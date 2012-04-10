class GraphsController < ApplicationController
    before_filter :load_graph, :except => [:index, :new, :create]

    caches_action :show, :cache_path => Proc.new {|c| c.request.url }

    def index
        @graphs = Graph.all
    end

    def show
        respond_to do |format|
            format.html {
                if request.xhr?
                    render 'graph', :layout => false
                end
            }
            format.json {
                if params[:prerendered] == 'true'
                    @graph.sort_attr = params[:sort_attr]
                    @graph.color_attr = params[:color_attr]
                    render_for_api :prerendered, :json => @graph
                elsif params[:layout] == 'tree'
                    render_for_api :hierarchy, :json => @graph
                else
                    render_for_api :everything, :json => @graph 
                end
            }
        end
    end

    def new
        @graph = Graph.new
    end

    def create
        @graph = Graph.new(params[:graph])
        @graph.import_data_from_attachment!
        redirect_to graph_path(@graph)
    end

    def edit
    end

    def update
        @graph.update_attributes(params[:graph])
        @graph.update_data_from_attachment!
        expire_fragment(Regexp.new(graph_path(@graph) + '\\.*'))
        redirect_to graph_path(@graph)
    end

    def destroy
        @graph.destroy
    end

    def load_graph
        @graph = Graph.find(params[:id])
    end
end
