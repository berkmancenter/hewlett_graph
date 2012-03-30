// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
var sortAttr = 'category', colorAttr = 'category';

var sizes = {
        'Micro': 10,
        'Meso': 10,
        'Macro': 10,
        'Research & Metrics': 10
    },
    subcatColorScaleFactor = 0.65,
    foci = {},
    retrievedData,
    catColorScale = d3.scale.category10(),
    dayColorScale = d3.scale.category10(),
    subcatColorScale = d3.scale.category10(),
    subcatColorsAreVeryDifferent = false,
    w,
    h;

function getFoci(groups) {
    var fociStack = [],
        foci = {},
        numGroups = groups.length,
        perRow = Math.ceil(Math.sqrt(numGroups)),
        numRows = Math.ceil(Math.sqrt(numGroups)),
        numInRow;

    for(i=0; i < numRows; i++) {
        numInRow = Math.min(perRow, numGroups - (i * perRow));
        for(j=0; j < numInRow; j++) {
            fociStack.push(
                [(w / (numInRow + 1)) * (j + 1), (h / (numRows + 1)) * (i + 1)]
            );
        }
    }

    for (i in groups) {
        foci[groups[i]] = fociStack.pop();
    }
    return foci;
}

String.prototype.toInt = function() {
    var sum = 0;
    for (i=0; i < this.length; i++) {
        sum += this.charCodeAt(i);
    }
    return sum;
}

function getColor(node) {
    return getColorFromString(node[colorAttr].name);
}

function getColorFromString(text) {
    switch(colorAttr) {
        case 'day':
            return d3.rgb(dayColorScale(text.toInt()));
        case 'subcategory':
            // Evidently d3 has scales, which could probably do this for me
            if (subcatColorsAreVeryDifferent) {
                return d3.rgb(subcatColorScale(text.toInt()));
            } else {
                var subcategory = retrievedData.graph.subcategories.filter(function(subcat) { return subcat.name == text; })[0];
                var category = retrievedData.graph.categories.filter(function(cat) { return cat.name == subcategory.category_name; })[0];
                var colorDelta = (category.subcategories.map(function(s) { return s.name; }).indexOf(text) - Math.floor(category.subcategories.length / 2)) * subcatColorScaleFactor;
                return d3.rgb(catColorScale(category.name.toInt())).brighter(colorDelta); 
            }
        case 'category':
            return d3.rgb(catColorScale(text.toInt()));
    }
}

function getX(foci, node, index) {
    index = index || 0;
    xs = [];
    if (node[sortAttr] instanceof Array) {
        for (i in node[sortAttr]) {
            xs.push(foci[node[sortAttr][i].name][index]);
        }
    }
    else {
        xs.push(foci[node[sortAttr].name][index]);
    }
    return d3.mean(xs);
}

function getY(foci, node) {
    return getX(foci, node, 1);
}

function addLabels() {
    var groups = retrievedData.graph[sortAttr].map(function(s) { return s.name; });
    foci = getFoci(groups);
    var display = $('.label').css('display');
    $('.label').remove();
    for (i in groups) {
        $('<div />').appendTo('body').addClass('label').text(groups[i]).css({
            'left': /*$('svg').offset().left +*/ foci[groups[i]][0],
            'top': /*$('svg').offset().top +*/ foci[groups[i]][1],
            'display': display
        });
    }
}

function populateLegend() {
    $('#legend :not(:header)').remove();
    var $legend = $('<div />');
    retrievedData.graph[colorAttr].forEach(function(u) {
        $legend.append(function() {
            return $('<div class="legendEntry" />').append(function() {
                return $('<span class="swatch"/>').css('backgroundColor', getColorFromString(u.name));
            });
        });
    });
    $('#legend h2').after($legend.html());
}

function doEverything(data) {

    var nodes = data.graph.ideas;
    w = $('body').width() * 0.7,
    h = $(window).height() * 0.995,
    $('#graph').width(w);

    retrievedData = data;

    // These are here so plurals aren't an issue when switching sorting
    retrievedData.graph.category = retrievedData.graph.categories;
    retrievedData.graph.subcategory = retrievedData.graph.subcategories;

    var vis = d3.select("#graph").append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    foci = getFoci(data.graph[sortAttr].map(function(s) { return s.name; }));

    var force = d3.layout.force()
        .nodes(nodes)
        .links([])
        .size([w, h])
        .gravity(0)
        .theta(1.2)
        .charge(-6)
        //.friction(0.9)
        .start();

    var node = vis.selectAll("circle.node")
        .data(nodes)
      .enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return getX(foci, d); })
        .attr("cy", function(d) { return getY(foci, d); })
        .attr("r", function(d) { return sizes[d.category.name]; })
        .style("fill", function(d, i) { return getColor(d); })
        .style("stroke", function(d, i) { return d3.rgb(getColor(d)).darker(2); })
        .style("stroke-width", 1.5);

    vis.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);

    force.on("tick", function(e) {

     var k = .05 * e.alpha;
      nodes.forEach(function(o, i) {
        o.y += (getY(foci, o) - o.y) * k;
        o.x += (getX(foci, o) - o.x) * k;
      });

      vis.selectAll("circle.node")
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })
    });

    d3.selectAll("circle.node").on("click", function(c) {
        d3.select(this).classed('activated', true);
        d3.select("#category").text(c.category.name);
        d3.select("#subcategory").text(c.subcategory.name);
        d3.select("#stakeholders").text(c.stakeholders.map(function(s) { return ' ' + s.name; }).toString());
        d3.select("#idea").text(c.content);
        $('#data').show();
        }).on("mouseout", function() { d3.select(this).classed('activated', false); $('#data').hide(); });

    addLabels();

    $('#showLabels').on("change", function(e) {
        $('.label').toggle();
    });

    $('#veryDiffSubcatColors').on('change', function(e) {
        subcatColorsAreVeryDifferent = $(this).is(':checked');
    });

    $("input[type=radio][name=sort]").on("change", function(e) {
        sortAttr = $(e.target).val();
        addLabels();
        force.start();
    });

    $("input[type=radio][name=color]").on("change", function(e) {
        d3.selectAll('circle.node')
            .transition().style("fill", function(d, i) { return getColor(d); })
            .transition().style("stroke", function(d, i) { return d3.rgb(getColor(d)).darker(2); });
        colorAttr = $(e.target).val();
        populateLegend();
        addLabels();
        force.start();
    });
}
