class QuestionsController < ApplicationController
    before_filter :load_graph
    before_filter :load_question, :except => [:index, :new, :create]
    def index
        @questions = @graph.questions
    end

    def show
    end

    def new
        @question = @graph.questions.new
    end

    def edit
    end

    def update
        @question.update_attributes(params[:question])
        redirect_to graph_question_path(@graph, @question)
    end

    def create
    end

    def destroy
    end
    def load_question
        @question = Question.find(params[:id])
    end
    def load_graph
        @graph = Graph.find(params[:graph_id])
    end
end
