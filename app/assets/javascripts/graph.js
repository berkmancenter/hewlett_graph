// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
var Graph = {
	config: {
		browserSpeed: 'slow',
		reorganizePercent: 0.09,
		subcatColorScaleFactor: 0.55,
		theta: 1.2,
		subcatColorsAreVeryDifferent: false,
		colorAttr: 'category',
		sortAttr: 'category',
		prevColorAttr: 'category',
		prevSortAttr: 'category',
		defaultWidth: 700,
		defaultHeight: 600,
		widthPercentage: 0.7,
		heightPercentage: 0.995,
		nodeRadius: 10,
		strokeWidth: 1.5,
		gravity: 0,
		charge: - 6,
	},
	data: {
		categories: {},
		subcategories: {},
		stakeholders: {},
		interventions: {},
		days: {}
	},
    hierarchy: {},
	width: 0,
	height: 0,
	id: 0,
	foci: {},
	colorFoci: {},
	catColorScale: d3.scale.category10(),
	dayColorScale: d3.scale.category10(),
	typeColorScale: d3.scale.category10(),
	subcatColorScale: d3.scale.category20(),
	forceLayout: {},
	tickCount: 0,
	totalTicks: 298,
	initialized: false,

	init: function() {
		if (Graph.config.browserSpeed == 'serverside') {
			Graph.config.reorganizePercent = 0.18;
			Graph.config.theta = 0.8;
		}

		$(document).on('ready', Graph.setup);
	},
	setup: function() {
		Graph.initDimensions();
        if (!Graph.initialized) {
            d3.select("#graph").append("svg:svg").attr("width", Graph.width).attr("height", Graph.height);
            d3.selectAll('body, #graph svg').attr('class', function() { return Graph.config.layout == 'tree' ? 'tree' : 'density'; });
        } else {
            d3.select("#graph").select("svg").transition().attr("width", Graph.width).attr("height", Graph.height);
            Graph.initialized = false;
        }
		Util.updateEventHandlers();
		Graph.getData();
	},
	getData: function() {

		var data = {};

        if (Graph.config.layout == 'tree') {
            data = {
                layout: 'tree'
            };
        } else {
            switch (Graph.config.browserSpeed) {
            case 'medium':
            case 'slow':
                data = {
                    prerendered: true,
                    sort_attr: Graph.config.sortAttr,
                    color_attr: Graph.config.colorAttr
                };
                break;
            case 'tree':
            }
        }

		$.getJSON('/graphs/' + Graph.id + '.json', data, Graph.update);
	},
	update: function(data) {
        if (Graph.config.layout == 'tree') {
            Graph.hierarchy = data.graph;
            Graph.createDendrogram();
            return;
        }
		Graph.data = data.graph;

		// These are here so plurals aren't an issue when switching sorting or colors
		Graph.data.category = data.graph.categories;
		Graph.data.subcategory = data.graph.subcategories;
		Graph.data.day = data.graph.days;

		switch (Graph.config.browserSpeed) {
		case 'serverside':
		case 'fast':
			if (!Graph.initialized) {
                Util.updateGraphEventHandlers();
				Graph.createForceLayout();
			}
			break;
		case 'medium':
		case 'slow':
			Graph.updateLameCircles();
		}

	},
    createDendrogram: function() {
        var i = 0,
        duration = 500,
        root;

        var tree = d3.layout.tree()
          .size([Graph.height, Graph.width - 700]);

        var diagonal = d3.svg.diagonal()
          .projection(function(d) { return [d.y, d.x]; });

        var vis = d3.select("#graph").select("svg")
          .append("svg:g")
          .attr("transform", "translate(40,0)");

          Graph.hierarchy.x0 = 0;
          Graph.hierarchy.y0 = 0;
          Graph.updateLegend();
          update(root = Graph.hierarchy);

        function update(source) {

          // Compute the new tree layout.
          var nodes = tree.nodes(root).reverse();

          // Update the nodes…
          var node = vis.selectAll("g.node")
              .data(nodes, function(d) { return d.id || (d.id = ++i); })

          var nodeEnter = node.enter().append("svg:g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });

          // Enter any new nodes at the parent's previous position.
          nodeEnter.append("svg:circle")
              .attr("r", function(d) { return d.children || d._children ? 8.5 : 6.5; })
              .style("fill", function(d) { return d._children || d.children ? "lightsteelblue" : Graph.typeColorScale(d.intervention_type.name); })
              .on("click", click);

          nodeEnter.append("svg:text")
              .attr("x", function(d) { return d.children || d._children ? 12 : 10; })
              .attr("y", 3)
              .text(function(d) { return typeof d.name == 'undefined' ? d.content : d.name; })
              .on("click", click);

          // Transition nodes to their new position.
          nodeEnter.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
              .style("opacity", 1)
              .select("circle")

          node.transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
              .style("opacity", 1);

          node.exit().transition()
              .duration(duration)
              .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
              .style("opacity", 1e-6)
              .remove();

          node
              .classed('closed', function(d) { return d._children; })
              .classed('open', function(d) { return d.children; })
              .classed('intervention', function(d) { return !d.children && !d._children; });

          // Update the links…
          var link = vis.selectAll("path.link")
              .data(tree.links(nodes), function(d) { return d.target.id; });

          // Enter any new links at the parent's previous position.
          link.enter().insert("svg:path", "g")
              .attr("class", "link")
              .attr("d", function(d) {
                  var o = {x: source.x0, y: source.y0};
                  return diagonal({source: o, target: o});
              })
          .transition()
              .duration(duration)
              .attr("d", diagonal);

          // Transition links to their new position.
          link.transition()
              .duration(duration)
              .attr("d", diagonal);

          // Transition exiting nodes to the parent's new position.
          link.exit().transition()
              .duration(duration)
              .attr("d", function(d) {
                  var o = {x: source.x, y: source.y};
                  return diagonal({source: o, target: o});
              })
          .remove();

          // Stash the old positions for transition.
          nodes.forEach(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
          });
        }

        function hideChildren(d) {
          d._children = d.children;
          d.children = null;
          update(d);
        }

        tree.nodes(root).forEach(function(d) { hideChildren(d); });

        // Toggle children on click.
        function click(d) {
          tree.nodes(root).forEach(function(e) { if (d.depth == e.depth && e.children && e.id != d.id) { hideChildren(e); } }); 
          if (d.children) {
              d._children = d.children;
              d.children = null;
          } else {
              d.children = d._children;
              d._children = null;
          }
          update(d);
        }

        d3.select(self.frameElement).style("height", "2000px");
    },
	createForceLayout: function() {
		Graph.foci = Graph.getFoci();
		Graph.colorFoci = Graph.getColorFoci();
		d3.select('svg').selectAll("circle.node").data(Graph.data.interventions, function(d) {
			return d.uuid
		}).enter().append("svg:circle").attr("class", "node").attr("cx", function(d) {
			return Node.getX(Graph.foci, d, Graph.config.sortAttr);
		}).attr("cy", function(d) {
			return Node.getY(Graph.foci, d, Graph.config.sortAttr);
		}).attr("r", function(d) {
			return Graph.config.nodeRadius;
		}).style("fill", function(d, i) {
			return Node.getColor(d);
		}).style("stroke", function(d, i) {
			return d3.rgb(Node.getColor(d)).darker(2);
		}).style("stroke-width", Graph.config.strokeWidth);

		Graph.forceLayout = d3.layout.force().nodes(d3.selectAll('circle.node').data()).size([Graph.width, Graph.height]).gravity(Graph.config.gravity).theta(Graph.config.theta).charge(Graph.config.charge);
		Graph.forceLayout.on("tick", Graph.onTick);
		Graph.forceLayout.start();
		Graph.updateLabels();
		Graph.updateLegend();
		Graph.initialized = true;
	},
	updateLameCircles: function() {
		var nodes = d3.select('svg').selectAll("circle.node").data(Graph.data.interventions, function(d) {
			return d.uuid
		});
		nodes.enter().append("svg:circle").attr("class", "node").attr("r", Graph.config.nodeRadius).attr("stroke-width", Graph.config.strokeWidth).attr("cx", function(d) {
			return d.x;
		}).attr("cy", function(d) {
			return d.y;
		});

		switch (Graph.config.browserSpeed) {
		case 'medium':
			nodes.transition().duration(1200).attr("cx", function(d) {
				return d.x;
			}).attr("cy", function(d) {
				return d.y;
			}).style("fill", function(d) {
				return Node.getColor(d);
			}).style("stroke", function(d) {
				return d3.rgb(Node.getColor(d)).darker(2);
			});
			break;
		case 'slow':
			nodes.style("fill", function(d) {
				return Node.getColor(d);
			}).style("stroke", function(d) {
				return d3.rgb(Node.getColor(d)).darker(2);
			}).attr("cx", function(d) {
				return d.x;
			}).attr("cy", function(d) {
				return d.y;
			});
		}

		Graph.updateLabels();
		Graph.updateLegend();

		if (!Graph.initialized) {
			Util.updateGraphEventHandlers();
			Graph.initialized = true;
		}
	},
	initDimensions: function() {
        if (Graph.config.layout == 'tree') {
            Graph.width = 1400;
            Graph.height = 630;
            return;
        }

		switch (Graph.config.browserSpeed) {
		case 'serverside':
		case 'fast':
		case 'medium':
		case 'slow':
			Graph.width = Graph.config.defaultWidth;
			Graph.height = Graph.config.defaultHeight;
			break;
		/*case 'fast':
			Graph.width = $('body').width() * Graph.config.widthPercentage;
			Graph.height = $(window).height() * Graph.config.heightPercentage;*/
		}
	},
	updateLegend: function() {
		$('#legend :not(:header)').remove();
        var $legend = $('<div />');
        if (Graph.config.layout != 'tree') {
            var entries = Graph.data[Graph.config.colorAttr];
            entries.forEach(function(u) {
                $legend.append(function() {
                    return $('<div class="legendEntry" />').append(function() {
                        return $('<span class="swatch"/>').css('backgroundColor', Util.stringToColor(u.name)).add($('<span class="legendText" />').text(u.name));
                    });
                });
            });
        } else {
            var entries = Graph.hierarchy.intervention_types;
            entries.forEach(function(u) {
                $legend.append(function() {
                    return $('<div class="legendEntry" />').append(function() {
                        return $('<span class="swatch"/>').css('backgroundColor', Graph.typeColorScale(u.name)).add($('<span class="legendText" />').text(u.name));
                    });
                });
            });
        }
        $('#legend :header').after($legend.html());
	},
	updateLabels: function() {
		var groups = Graph.data[Graph.config.sortAttr].map(function(s) {
			return s.name;
		}),
		hidden = $('#hideLabels').is(':checked'),
		position;
		$('.sortLabel').fadeOut(300, function() {
			$(this).remove();
		});
		switch (Graph.config.browserSpeed) {
		case 'serverside':
		case 'fast':
			groups.forEach(function(group) {
				$('<div class="sortLabel"/>').appendTo('body').text(group).css({
					'left': Graph.foci[group][0] + $('#graph').offset().left,
					'top': Graph.foci[group][1] + $('#graph').offset().top
				});
			});
			break;
		case 'medium':
		case 'slow':
			groups.forEach(function(group) {
				nodes = d3.selectAll('circle.node').filter(function(n) {
					if (n[Graph.config.sortAttr] instanceof Array) {
						return n[Graph.config.sortAttr].map(function(d) {
							return d.name;
						}).indexOf(group) != - 1 && n[Graph.config.sortAttr].length == 1;
					}
					else {
						return n[Graph.config.sortAttr].name == group;
					}
				});
				position = Graph.getNodesAvgPosition(nodes);
				$('<div class="sortLabel"/>').appendTo('body').text(group).css({
					'left': position[0] + $('#graph').offset().left,
					'top': position[1] + $('#graph').offset().top
				});
			});
		}
		if (!hidden) {
			$('.sortLabel').fadeIn();
		}
	},
	outputNodes: function() {
		$('<span id="d3Nodes" />').text(JSON.stringify(Graph.forceLayout.nodes())).appendTo('body');
	},
	updateFoci: function() {
		Graph.foci = Graph.getFoci();
	},
	updateColorFoci: function() {
		Graph.colorFoci = Graph.getColorFoci();
	},
	getFoci: function() {
		return Util.getFociFromArray(Util.flattenData(Graph.config.sortAttr));
	},
	getColorFoci: function() {
		return Util.getFociFromArray(Util.flattenData(Graph.config.colorAttr));
	},
	getNodesAvgPosition: function(nodes) {
		var avg = [0, 0];
		nodes.each(function(node) {
			avg[0] += node.x;
			avg[1] += node.y;
		});
		avg[0] /= nodes[0].length;
		avg[1] /= nodes[0].length;
		return avg;
	},
	onTick: function(e) {
		var k = .05 * e.alpha,
		thisFoci = Graph.foci,
		nodeAttr = Graph.config.sortAttr;
		if (
		/*Graph.config.oldSortAttr != Graph.config.colorAttr &&*/
		Graph.config.sortAttr != Graph.config.colorAttr) {
			if (Graph.tickCount < Graph.totalTicks * Graph.config.reorganizePercent) {
				thisFoci = Graph.colorFoci;
				nodeAttr = Graph.config.colorAttr;
			}
			else if (Graph.tickCount == Math.floor(Graph.totalTicks * Graph.config.reorganizePercent) + 1) {
				Graph.forceLayout.start();
			}
		}
		if (Graph.tickCount == Graph.totalTicks - 120) {
            // TODO: Fix this
			//	Graph.correctLabelPositions();
		}
		if (Graph.tickCount == Graph.totalTicks - 1 && Graph.config.browserSpeed == 'serverside') {
			Graph.outputNodes();
		}

		Graph.forceLayout.nodes().forEach(function(o, i) {
			o.y += (Node.getY(thisFoci, o, nodeAttr) - o.y) * k;
			o.x += (Node.getX(thisFoci, o, nodeAttr) - o.x) * k;
		});
		Graph.tickCount++;

		d3.selectAll("circle.node").attr("cx", function(d) {
			return d.x;
		}).attr("cy", function(d) {
			return d.y;
		});
	},
	correctLabelPositions: function() {
		var position, nodes;
		$('div.sortLabel').fadeOut(150, function() {
			$(this).each(function(label) {
				nodes = Graph.forceLayout.nodes().filter(function(d) {
					return d[Graph.config.sortAttr].name == $(label).text();
				});
				position = Graph.getNodesAvgPosition(nodes);
				$(this).css({
					left: position[0] - 20,
					top: position[1] + 20
				});
			});
			$(this).fadeIn(150);
		});
	},
};
var Node = {

	getColor: function(node) {
		return Util.stringToColor(node[Graph.config.colorAttr].name);
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
		return Node.getX(foci, node, attr, 1);
	},
}
var Util = {
	updateGraphEventHandlers: function() {
		d3.selectAll("circle.node").on("click", function(c) {
			d3.select('circle.node.activated').classed('activated', false);
			d3.select(this).classed('activated', true);
			d3.select("#category").text(c.category.name);
			d3.select("#subcategory").text(c.subcategory.name);
			d3.select("#stakeholders").text(c.stakeholders.map(function(s) {
				return ' ' + s.name;
			}).toString());
			d3.select("#intervention").text(c.content);
			$('#data').show();
		});

	},
	updateEventHandlers: function() {
		$("input[name=sort], input[name=color], input[name=speed], #hideLabels, #veryDiffSubcatColors").off("change");
        $('#dataClose, #controls h2, #changeLayout').off('click');

        $('#changeLayout').on('click', function() {
            $('body').toggleClass('tree');
            $('body').toggleClass('density');
            $('svg').remove();
            $('#dataClose').trigger('click');
            $('.sortLabel').remove();
            $(this).text(function() { return $(this).text() == 'Tree View' ? 'Density View' : 'Tree View'; });
            Graph.initialized = false;
            Graph.config.layout = Graph.config.layout == 'tree' ? 'density' : 'tree';
            Graph.setup();
        });
         
		$('#dataClose').on("click", function() {
			d3.select('circle.node.activated').classed('activated', false);
			$('#data').hide();
			return false;
		});

		$('#hideLabels').on("change", function(e) {
            if ($(this).is(':checked')) {
                $('.sortLabel').fadeOut();
            } else {
                $('.sortLabel').fadeIn();
            }
		});

		$('#veryDiffSubcatColors').on('change', function(e) {
			Graph.config.subcatColorsAreVeryDifferent = $(this).is(':checked');
		});

		$("input[name=sort]").on("change", function(e) {
			Graph.config.oldSortAttr = Graph.config.sortAttr;
			Graph.config.sortAttr = $(this).val();
			switch (Graph.config.browserSpeed) {
			case 'serverside':
			case 'fast':
				Graph.tickCount = 0;
				Graph.updateFoci();
				Graph.updateLabels();
				Graph.forceLayout.start();
				break;
			case 'medium':
			case 'slow':
				Graph.getData();
			}
		});

        $('a.question').on('click', function(e) {
            $('#questions li').removeClass('selected');
            $(this).parent().addClass('selected');
            $('input[name=sort][value=' + $(this).attr('data-sort') + ']').attr('checked', true).trigger('change');
            $('input[name=color][value=' + $(this).attr('data-color') + ']').attr('checked', true).trigger('change');
            $('#hideLabels').attr('checked', function() { return $(e.target).attr('data-hide-labels') == 't' ? true : false; });
            return false;
            //$(this).attr('data-selected-intervention')
        });

		$("input[name=color]").on("change", function(e) {
			Graph.config.oldColorAttr = Graph.config.colorAttr;
			Graph.config.colorAttr = $(e.target).val();
			switch (Graph.config.browserSpeed) {
			case 'serverside':
			case 'fast':
				Graph.tickCount = 0;
				d3.selectAll('circle.node').transition().duration(300).style("fill", function(d, i) {
					return Node.getColor(d);
				}).style("stroke", function(d, i) {
					return d3.rgb(Node.getColor(d)).darker(2);
				});
				Graph.updateColorFoci();
				Graph.updateLegend();
				Graph.forceLayout.start();
				break;
			case 'medium':
			case 'slow':
				Graph.getData();
			}
		});

        $('input[name=color], input[name=sort]').on('click', function() { $('#questions li').removeClass('selected'); });

		$('input[name=speed][value=' + Graph.config.browserSpeed + ']').attr('checked', true);
		$('input[name=speed]').on('change', function() {
			Graph.config.browserSpeed = $(this).val();
            if (Graph.forceLayout.on) {
                Graph.forceLayout.on("tick", null);
            }
            Graph.setup();
		});
		$('#controls h2 ~ *').slideUp();
		$('#controls h2').on('click', function() {
			$(this).find('~ *').slideToggle();
		});
	},
    getSubcatColor: function(string) {
        // Evidently d3 has scales, which could probably do this for me
        if (Graph.config.subcatColorsAreVeryDifferent) {
            return d3.rgb(Graph.subcatColorScale(string));
        } else {
            var subcategory = Graph.data.subcategories.filter(function(subcat) {
                return subcat.name == string;
            })[0],
            category = Graph.data.categories.filter(function(cat) {
                return cat.uuid == subcategory.category_uuid;
            })[0],
            colorDelta = category.subcategory_uuids.indexOf(subcategory.uuid);
            colorDelta = (colorDelta - Math.floor(category.subcategory_uuids.length / 2)) * Graph.config.subcatColorScaleFactor;
            return d3.rgb(Graph.catColorScale(category.name)).darker(colorDelta);
        }
    },
	stringToColor: function(string) {
		switch (Graph.config.colorAttr) {
		case 'day':
			return d3.rgb(Graph.dayColorScale(string));
		case 'subcategory':
            return Util.getSubcatColor(string);
		case 'category':
			return d3.rgb(Graph.catColorScale(string));
		}
	},
	flattenData: function(attr) {
		return Graph.data[attr].map(function(s) {
			return s.name;
		});
	},
	getFociFromArray: function(groups) {
		// TODO: use d3 scales to do this
		var fociStack = [],
		foci = {},
		numGroups = groups.length,
		perRow = Math.ceil(Math.sqrt(numGroups)),
		numRows = Math.ceil(Math.sqrt(numGroups)),
		numInRow;

		for (i = 0; i < numRows; i++) {
			numInRow = Math.min(perRow, numGroups - (i * perRow));
			for (j = 0; j < numInRow; j++) {
				fociStack.push([(Graph.width / (numInRow + 1)) * (j + 1), (Graph.height / (numRows + 1)) * (i + 1)]);
			}
		}

		fociStack.reverse();

		for (i in groups) {
			foci[groups[i]] = fociStack.pop();
		}
		return foci;
	}
};

