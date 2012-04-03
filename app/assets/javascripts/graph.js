// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
var Graph = {
    config: {
        browserSpeed: 'slow',
        totalTicks: 298,
        reorganizePercent: 0.09,
        subcatColorScaleFactor: 0.65,
        theta: 1.2,
        subcatColorsAreVeryDifferent: false,
        colorAttr: 'category',
        sortAttr: 'category',
        prevColorAttr: 'category',
        prevSortAttr: 'category',
    },
    foci: {},
    colorFoci: {},
    data: {
        categories: {},
        subcategories: {},
        stakeholders: {},
        ideas: {},
        day: {}
    },
    catColorScale: d3.scale.category10(),
    dayColorScale: d3.scale.category10(),
    subcatColorScale: d3.scale.category10(),
    forceLayout: {},
    tickCount: 0,

    init: function(data) {

        Graph.config.browserSpeed = browserSpeed;
        if (Graph.config.browserSpeed == 'serverside') {
            Graph.config.reorganizePercent = 0.20;
            Graph.config.theta = 0.8;
        }

        Graph.data.categories = data.graph.categories;
        Graph.data.subcategories = data.graph.subcategories;
        Graph.data.stakeholders = data.graph.stakeholders;
        Graph.data.ideas = data.graph.ideas;
        Graph.data.day = data.graph.day;

        dimensions = Graph.getDimensions();
        w = dimensions.w;
        h = dimensions.h;
        $('#graph').width(w);

        // These are here so plurals aren't an issue when switching sorting
        // I need to get rid of this.
        Graph.data.category = data.graph.categories;
        Graph.data.subcategory = data.graph.subcategories;

        var vis = d3.select("#graph").append("svg:svg").attr("width", w).attr("height", h);

        Graph.foci = Graph.getFoci();
        Graph.colorFoci = Graph.getColorFoci();

        Graph.forceLayout = d3.layout.force()
            .nodes(Graph.data.ideas)
            .links([])
            .size([w, h])
            .gravity(0)
            .theta(Graph.config.theta)
            .charge(-6)
            .start();

        var node = vis.selectAll("circle.node").data(Graph.data.ideas).enter()
            .append("svg:circle")
            .attr("class", "node")
            .attr("cx", function(d) { return Graph.getX(Graph.foci, d, Graph.config.sortAttr); })
            .attr("cy", function(d) { return Graph.getY(Graph.foci, d, Graph.config.sortAttr); })
            .attr("r", function(d) { return 10; })
            .style("fill", function(d, i) { return Graph.getColor(d); })
            .style("stroke", function(d, i) { return d3.rgb(Graph.getColor(d)).darker(2); })
            .style("stroke-width", 1.5);

        vis.style("opacity", 1e-6).transition().duration(1000).style("opacity", 1);

        Graph.updateLabels();
        Graph.updateLegend();
        Graph.addEventHandlers();
    },

    getDimensions: function() {
        switch (this.config.browserSpeed) {
        case 'serverside':
        case 'medium':
        case 'slow':
            return {
                w: 700,
                h: 600
            }
        case 'fast':
            return {
                w: $('body').width() * 0.7,
                h: $(window).height() * 0.995
            }
        }
    },
    updateLegend: function() {
        $('#legend :not(:header)').remove();
        var $legend = $('<div />');
        this.data[this.config.colorAttr].forEach(function(u) {
            $legend.append(function() {
                return $('<div class="legendEntry" />').append(function() {
                    return $('<span class="swatch"/>').css('backgroundColor', Graph.stringToColor(u.name)).add($('<span class="legendText" />').text(u.name));
                });
            });
        });
        $('#legend :header').after($legend.html());
    },
    updateNodesFromData: function(data) {
        var nodes = d3.selectAll('circle.node');
        nodes.data(JSON.parse(data));

        switch (Graph.config.browserSpeed) {
            case 'medium':
                nodes
                    .transition()
                    .duration(1200)
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })
                    .style("fill", function(d) { return Graph.getColor(d); })
                    .style("stroke", function(d) { return d3.rgb(Graph.getColor(d)).darker(2); });
                break;
            case 'slow':
                nodes
                    .style("fill", function(d) { return Graph.getColor(d); })
                    .style("stroke", function(d) { return d3.rgb(Graph.getColor(d)).darker(2); })
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
        }
        Graph.forceLayout.start().alpha(0);
    },
    updateLabels: function() {
        var groups = this.data[this.config.sortAttr].map(function(s) {
            return s.name;
        }),
            display = $('.label').css('display');
        $('.label').fadeOut(300, function() {
            $(this).remove();
        });
        for (i in groups) {
            $('<div class="label"/>').appendTo('body').text(groups[i]).css({
                'left': this.foci[groups[i]][0] - 30,
                'top': this.foci[groups[i]][1]
            });
        }
        if (display != 'none') {
            $('.label').fadeIn();
        }
    },
    outputNodes: function() {
        $('<span id="d3Nodes" />').text(JSON.stringify(this.forceLayout.nodes())).appendTo('body');
    },
    getFociFromArray: function(groups) {
        var fociStack = [],
            foci = {},
            numGroups = groups.length,
            perRow = Math.ceil(Math.sqrt(numGroups)),
            numRows = Math.ceil(Math.sqrt(numGroups)),
            numInRow;

        for (i = 0; i < numRows; i++) {
            numInRow = Math.min(perRow, numGroups - (i * perRow));
            for (j = 0; j < numInRow; j++) {
                fociStack.push([(w / (numInRow + 1)) * (j + 1), (h / (numRows + 1)) * (i + 1)]);
            }
        }

        for (i in groups) {
            foci[groups[i]] = fociStack.pop();
        }
        return foci;
    },
    updateFoci: function() {
        this.foci = this.getFoci();
    },
    updateColorFoci: function() {
        this.colorFoci = this.getColorFoci();
    },
    getFoci: function() {
        return this.getFociFromArray(this.flattenData(this.config.sortAttr));
    },
    getColorFoci: function() {
        return this.getFociFromArray(this.flattenData(this.config.colorAttr));
    },
    flattenData: function(attr) {
        return this.data[attr].map(function(s) { return s.name; });
    },
    getX: function(foci, node, attr, index) {
        // I should do caching in here so it doesn't take any time
        index = index || 0;
        var xs;
        if (node[attr] instanceof Array) {
            xs = [];
            for (i in node[attr]) {
                xs.push(foci[node[attr][i].name][index]);
            }
            xs = d3.mean(xs);
        }
        else {
            xs = foci[node[attr].name][index];
        }
        return xs;
    },
    getY: function(foci, node, attr) {
        return this.getX(foci, node, attr, 1);
    },
    getColor: function(node) {
        return this.stringToColor(node[this.config.colorAttr].name);
    },
    stringToColor: function(string) {
        switch (this.config.colorAttr) {
        case 'day':
            return d3.rgb(this.dayColorScale(string));
        case 'subcategory':
            // Evidently d3 has scales, which could probably do this for me
            if (this.config.subcatColorsAreVeryDifferent) {
                return d3.rgb(this.subcatColorScale(string));
            } else {
                var subcategory = this.data.subcategories.filter(function(subcat) {
                        return subcat.name == string;
                    })[0],
                    category = this.data.categories.filter(function(cat) {
                        return cat.name == subcategory.category_name;
                    })[0],
                    colorDelta = (category.subcategories.map(function(s) {
                        return s.name;
                    }).indexOf(string) - Math.floor(category.subcategories.length / 2)) * this.config.subcatColorScaleFactor;
                return d3.rgb(this.catColorScale(category.name)).brighter(colorDelta);
            }
        case 'category':
            return d3.rgb(this.catColorScale(string));
        }
    },
    onTick: function(e) {
        var k = .05 * e.alpha,
            thisFoci = Graph.foci,
            nodeAttr = Graph.config.sortAttr;
        if (Graph.config.oldSortAttr != Graph.config.colorAttr
            && Graph.config.sortAttr != Graph.config.colorAttr) {
            if (Graph.tickCount < Graph.config.totalTicks * Graph.config.reorganizePercent) {
                thisFoci = Graph.colorFoci;
                nodeAttr = Graph.config.colorAttr;
            }
            else if (Graph.tickCount == Math.floor(Graph.config.totalTicks * Graph.config.reorganizePercent) + 1) {
                Graph.forceLayout.start();
            }
        }
        if (Graph.tickCount == Graph.config.totalTicks - 1) {
            Graph.outputNodes();
        }

        Graph.forceLayout.nodes().forEach(function(o, i) {
            o.y += (Graph.getY(thisFoci, o, nodeAttr) - o.y) * k;
            o.x += (Graph.getX(thisFoci, o, nodeAttr) - o.x) * k;
        });
        Graph.tickCount++;

        d3.selectAll("circle.node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    },
    addEventHandlers: function() {
        if (this.config.browserSpeed != 'slow') {
            this.forceLayout.on("tick", this.onTick);
        }

        d3.selectAll("circle.node").on("click", function(c) {
            d3.select(this).classed('activated', true);
            d3.select("#category").text(c.category.name);
            d3.select("#subcategory").text(c.subcategory.name);
            d3.select("#stakeholders").text(c.stakeholders.map(function(s) { return ' ' + s.name; }).toString());
            d3.select("#idea").text(c.content);
            $('#data').show();
        }).on("mouseout", function() {
            d3.select(this).classed('activated', false);
            $('#data').hide();
        });

        $('#showLabels').on("change", function(e) { $('.label').fadeToggle(); });

        $('#veryDiffSubcatColors').on('change', function(e) {
            Graph.config.subcatColorsAreVeryDifferent = $(this).is(':checked');
        });

        $("input[type=radio][name=sort]").on("change", function(e) {
            switch (Graph.config.browserSpeed) {
                case 'serverside':
                case 'fast':
                    Graph.tickCount = 0;
                    Graph.config.oldSortAttr = Graph.config.sortAttr;
                    Graph.config.sortAttr = $(e.target).val();
                    Graph.updateFoci();
                    Graph.updateLabels();
                    Graph.forceLayout.start();
                case 'medium':
                case 'slow':
                    Graph.updateLabels();
            }
        });

        $("input[type=radio][name=color]").on("change", function(e) {
            switch (Graph.config.browserSpeed) {
                case 'serverside':
                case 'fast':
                    Graph.tickCount = 0;
                    Graph.config.oldColorAttr = Graph.config.colorAttr;
                    Graph.config.colorAttr = $(e.target).val();
                    d3.selectAll('circle.node')
                        .transition()
                        .duration(300)
                        .style("fill", function(d, i) { return Graph.getColor(d); })
                        .style("stroke", function(d, i) { return d3.rgb(Graph.getColor(d)).darker(2); });
                    Graph.updateColorFoci();
                    Graph.updateLegend();
                    Graph.forceLayout.start();
                    break;
                case 'medium':
                case 'slow':
                    Graph.updateLegend();
            }
        });

        $('input[name=speed][value=' + Graph.config.browserSpeed + ']').attr('checked', true);
        $('input[type=radio][name=speed]').on('change', function() { Graph.config.browserSpeed = $(this).val(); });
        $('#controls h2 ~ *').slideUp();
        $('#controls h2').on('click', function() { $(this).find('~ *').slideToggle(); });
    },
};
