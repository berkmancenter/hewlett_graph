require 'capybara'
require 'capybara/dsl'
require 'nokogiri'
require 'headless'

Capybara.default_driver = :webkit
Capybara.default_wait_time = 20
Capybara.app_host = 'http://localhost:3000' 

module GraphHelper
    include Capybara::DSL

    def rendered_svg(graph, sort_attr, color_attr)
        cache = ActiveSupport::Cache::FileStore.new Rails.public_path

        key = [graph.id, sort_attr, color_attr]
        if cache.exist?(key)
            return cache.read(key)
        else
            Headless.ly({ :dimensions => '800x600x24'}) do |headless|
                visit( graph_path(graph, :sort_attr => sort_attr, :color_attr => color_attr, :browser_speed => :serverside) )
                page.find('#d3Nodes')
                text = Nokogiri::HTML.parse(page.html).css('#d3Nodes').first.inner_text
                cache.write(key, text)
                return text
            end
        end
    end
end
