require 'capybara'
require 'capybara/dsl'
require 'nokogiri'
require 'headless'

Capybara.default_driver = :webkit
Capybara.app_host = 'http://localhost:3000' 

module GraphHelper
    include Capybara::DSL

    def rendered_svg(graph, sort_attr, color_attr)
        Headless.ly({ :dimensions => '800x600x24'}) do |headless|
            visit( graph_path(graph, :sort_attr => sort_attr, :color_attr => color_attr) )
            sleep 8 
            return Nokogiri::HTML.parse(page.html).css('#graph').first.inner_html
        end
    end
end
