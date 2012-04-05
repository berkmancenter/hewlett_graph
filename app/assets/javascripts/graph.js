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
		ideas: {},
		days: {}
	},
	width: 0,
	height: 0,
	id: 0,
	foci: {},
	colorFoci: {},
	catColorScale: d3.scale.category10(),
	dayColorScale: d3.scale.category10(),
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
        } else {
            d3.select("#graph").select("svg").transition().attr("width", Graph.width).attr("height", Graph.height);
            Graph.initialized = false;
        }
		Util.updateEventHandlers();
		Graph.getData();
	},
	getData: function() {

		var data = {};

		switch (Graph.config.browserSpeed) {
		case 'medium':
		case 'slow':
			data = {
				prerendered: true,
				sort_attr: Graph.config.sortAttr,
				color_attr: Graph.config.colorAttr
			};
		}

		$.getJSON('/graphs/' + Graph.id + '.json', data, Graph.update);
	},
	update: function(data) {
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
	createForceLayout: function() {
		Graph.foci = Graph.getFoci();
		Graph.colorFoci = Graph.getColorFoci();
		d3.select('svg').selectAll("circle.node").data(Graph.data.ideas, function(d) {
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
		var nodes = d3.select('svg').selectAll("circle.node").data(Graph.data.ideas, function(d) {
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
		switch (Graph.config.browserSpeed) {
		case 'serverside':
		case 'medium':
		case 'slow':
			Graph.width = Graph.config.defaultWidth;
			Graph.height = Graph.config.defaultHeight;
			break;
		case 'fast':
			Graph.width = $('body').width() * Graph.config.widthPercentage;
			Graph.height = $(window).height() * Graph.config.heightPercentage;
		}
	},
	updateLegend: function() {
		$('#legend :not(:header)').remove();
		var $legend = $('<div />'),
		entries = Graph.data[Graph.config.colorAttr];
		entries.forEach(function(u) {
			$legend.append(function() {
				return $('<div class="legendEntry" />').append(function() {
					return $('<span class="swatch"/>').css('backgroundColor', Util.stringToColor(u.name)).add($('<span class="legendText" />').text(u.name));
				});
			});
		});
		$('#legend :header').after($legend.html());
	},
	updateLabels: function() {
		var groups = Graph.data[Graph.config.sortAttr].map(function(s) {
			return s.name;
		}),
		display = $('.sortLabel').css('display'),
		position;
		$('.sortLabel').fadeOut(300, function() {
			$(this).remove();
		});
		switch (Graph.config.browserSpeed) {
		case 'serverside':
		case 'fast':
			groups.forEach(function(group) {
				$('<div class="sortLabel"/>').appendTo('body').text(group).css({
					'left':
					Graph.foci[group][0],
					'top': Graph.foci[group][1]
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
					'left': position[0],
					'top': position[1]
				});
			});
		}
		if (display != 'none') {
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
			d3.select("#idea").text(c.content);
			$('#data').show();
		});

	},
	updateEventHandlers: function() {
		$("input[name=sort], input[name=color], input[name=speed], #showLabels, #veryDiffSubcatColors").off("change");
        $('#dataClose, #controls h2').off('click');

		$('#dataClose').on("click", function() {
			d3.select('circle.node.activated').classed('activated', false);
			$('#data').hide();
			return false;
		});

		$('#showLabels').on("change", function(e) {
			$('.sortLabel').fadeToggle();
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

		$('input[name=speed][value=' + Graph.config.browserSpeed + ']').attr('checked', true);
		$('input[name=speed]').on('change', function() {
			Graph.config.browserSpeed = $(this).val();
            Graph.setup();
		});
		$('#controls h2 ~ *').slideUp();
		$('#controls h2').on('click', function() {
			$(this).find('~ *').slideToggle();
		});
	},
	stringToColor: function(string) {
		switch (Graph.config.colorAttr) {
		case 'day':
			return d3.rgb(Graph.dayColorScale(string));
		case 'subcategory':
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

