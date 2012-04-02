// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

var sizes = {
        'Micro': 10,
        'Meso': 10,
        'Macro': 10,
        'Research & Metrics': 10
    },
    totalTicks = 298,
    reorganizePercent = 0.15,
    subcatColorScaleFactor = 0.65,
    ticks = 0,
    theta = 1.2,
    foci = {},
    colorFoci = {},
    retrievedData,
    catColorScale = d3.scale.category10(),
    dayColorScale = d3.scale.category10(),
    subcatColorScale = d3.scale.category10(),
    subcatColorsAreVeryDifferent = false,
    w,
    h,
    k,
    xs,
    intermediateFoci,
    force;

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

function getColorFieldFoci() {
    return getFoci(retrievedData.graph[colorAttr].map(function(s) { return s.name; }));
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

function getX(foci, node, attr, index) {
    // I should do caching in here so it doesn't take any time
    index = index || 0;
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
}

function getY(foci, node, attr) {
    return getX(foci, node, attr, 1);
}

function replaceSVG(data) {
    force.stop();
    $('#graph').empty().append(data);
}

function addLabels() {
    var groups = retrievedData.graph[sortAttr].map(function(s) { return s.name; });
    var display = $('.label').css('display');
    $('.label').fadeOut(300, function() { $(this).remove(); });
    for (i in groups) {
        $('<div />').appendTo('body').addClass('label').text(groups[i]).css({
            'left': /*$('svg').offset().left +*/ foci[groups[i]][0],
            'top': /*$('svg').offset().top +*/ foci[groups[i]][1]
        }).fadeIn();
    }
}

function populateLegend() {
    $('#legend :not(:header)').remove();
    var $legend = $('<div />');
    retrievedData.graph[colorAttr].forEach(function(u) {
        $legend.append(function() {
            return $('<div class="legendEntry" />').append(function() {
                return $('<span class="swatch"/>').css('backgroundColor', getColorFromString(u.name)).add($('<span class="legendText" />').text(u.name));
            });
        });
    });
    $('#legend h2').after($legend.html());
}

function doEverything(data) {

    var nodes = data.graph.ideas;
    /*w = $('body').width() * 0.7;
    h = $(window).height() * 0.995;*/
    w = 700;
    h = 600;
    $('#graph').width(w);

    retrievedData = data;

    // These are here so plurals aren't an issue when switching sorting
    retrievedData.graph.category = retrievedData.graph.categories;
    retrievedData.graph.subcategory = retrievedData.graph.subcategories;

    var vis = d3.select("#graph").append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    foci = getFoci(data.graph[sortAttr].map(function(s) { return s.name; }));
    colorFoci = getColorFieldFoci();

    force = d3.layout.force()
        .nodes(nodes)
        .links([])
        .size([w, h])
        .gravity(0)
        .theta(theta)
        .charge(-6)
        //.friction(0.9)
        .start();

    var node = vis.selectAll("circle.node")
        .data(nodes)
        .enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return getX(foci, d, sortAttr); })
        .attr("cy", function(d) { return getY(foci, d, sortAttr); })
        .attr("r", function(d) { return sizes[d.category.name]; })
        .style("fill", function(d, i) { return getColor(d); })
        .style("stroke", function(d, i) { return d3.rgb(getColor(d)).darker(2); })
        .style("stroke-width", 1.5);

    vis.style("opacity", 1e-6)
      .transition()
        .duration(1000)
        .style("opacity", 1);

    // It looks like animation decays.  Right now it takes 298 ticks to complete.
    force.on("tick", function(e) {
        k = .05 * e.alpha;
        var thisFoci = foci;
        var nodeAttr = sortAttr;
        if (oldSortAttr != colorAttr && sortAttr != colorAttr) {
            if (ticks < totalTicks * reorganizePercent) {
                thisFoci = colorFoci;
                nodeAttr = colorAttr;
            }
            else if (ticks == Math.floor(totalTicks * reorganizePercent) + 1){
                force.start();
            }
        }

        nodes.forEach(function(o, i) {
            o.y += (getY(thisFoci, o, nodeAttr) - o.y) * k;
            o.x += (getX(thisFoci, o, nodeAttr) - o.x) * k;
        });
        ticks++;

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
    populateLegend();

    $('#showLabels').on("change", function(e) {
        $('.label').toggle();
    });

    $('#veryDiffSubcatColors').on('change', function(e) {
        subcatColorsAreVeryDifferent = $(this).is(':checked');
    });

    if (!slowJs) {
    $("input[type=radio][name=sort]").on("change", function(e) {
        ticks = 0;
        oldSortAttr = sortAttr;
        sortAttr = $(e.target).val();
        foci = getFoci(retrievedData.graph[sortAttr].map(function(s) { return s.name; }));
        colorFoci = getColorFieldFoci();
        addLabels();
        force.start();
    });

    $("input[type=radio][name=color]").on("change", function(e) {
        ticks = 0;
        d3.selectAll('circle.node')
            .transition().duration(300).style("fill", function(d, i) { return getColor(d); })
            .transition().duration(300).style("stroke", function(d, i) { return d3.rgb(getColor(d)).darker(2); });
        colorAttr = $(e.target).val();
        colorFoci = getColorFieldFoci();
        populateLegend();
        force.start();
    });
    }
}
