makeCompare();

function makeCompare() {
	// ========== CONSTANTS ==========
	var COLS = 20;
	var DB_SHIFT = 200

	var text_color = '#bbbbbb';
	var highlight = '#f7cb38ff';
	var selected = '#f73859ff';

	var countries = ['China', 'South Korea', 'Japan', 'Taiwan', 'Thailand'];
	var allData;

	// ========== CONTROLS ===========
	// functions for controls
	var selectedCountry = 'China';
	var showSize = d3.select('#ratings').classed('selected');

	d3.select('#timecontrol').selectAll('.country')
		.on('mouseover', function() {
			// TODO?
		})
		.on('click', function() {
			var keyword = d3.select(this).text().trim();
			if (selectedCountry === keyword) {
				selectedCountry = ''
				d3.select(this).classed('selected', false);
			}
			else if (countries.includes(keyword)) {
				selectedCountry = keyword;
				d3.select('#timecontrol').selectAll('.country').classed('selected', false);
				d3.select(this).classed('selected', true);
			}
			drawChart();
			drawFrames();
			drawLines(selectedCountry);
		});

	d3.select('#timecontrol').selectAll('#ratings')
		.on('mouseover', function() {
			// TODO?
		})
		.on('click', function() {
			d3.select(this).classed('selected', !showSize);
			showSize = d3.select('#ratings').classed('selected');
			drawChart();
			drawFrames();
		});
	
	// ========== CHART =============
	var plotWidth = 700;
	var plotHeight = 550;
	var buf = 60;
	var marginLeft = 40;
	var subwidth = 160

	// use 'var' to scope properly
	var x = d3.scaleLinear()
		.domain([0, COLS - 1])
		.range([buf + marginLeft, buf + marginLeft + subwidth]);
	var y= d3.scaleLinear()
		.domain([6, 10])
		.range([plotHeight - buf, buf]);
	var r = d3.scaleLinear()
		.domain([0, 50000])
		.range([0, 8]);

	// add an SVG element to the DOM
	var svg = d3.select('svg#compare')
		.attr('width', plotWidth)
		.attr('height', plotHeight);

	// draw axis
	svg.append('g')
		.attr("transform", "translate(60,0)")
		.call(d3.axisLeft(y))
		.append('text')
		    .attr('fill', text_color)
		    .attr('transform','translate(-40, 260)rotate(270)')
		    .text('Rating');

	// load data
	d3.csv('data/mdl_douban_data_100_min_img.csv', function(d, i) {
		return {
			id: +i,
			name: d.name,
			country: d.country,
			mdl_rating: +d.mdl_rating,
			mdl_num_ratings: +d.mdl_num_ratings,
			db_rating: +d.db_rating,
			db_num_ratings: +d.db_num_ratings
		}
	}).then(function(data) {
		allData = data;
		drawChart();
		drawFrames();
		drawLines(selectedCountry);
	});

	function drawChart() {
		var rad = 5;

		// assign id to redraw properly
		var mdl_circles = svg.selectAll('.mdl_circle')
			.data(allData, function(d) { return 'mdl' + d.id; });

		// MYDRAMALIST
		mdl_circles.enter().append('circle')
			.attr('class', 'mdl_circle')
			.style("opacity", 0.7)
			.attr('r', function(d) {
				if (showSize) {
					return r(d.mdl_num_ratings);
				}
				return rad;
			})
			.style('fill', function(d) { 
				if (selectedCountry === d.country) {
					return highlight;
				}
				return text_color;
			})
			.attr('cx', function(d) { return x(d.id % COLS); })
			.attr('cy', function(d) { return y(d.mdl_rating); })
		.on('mouseover', function(d) {
			d3.select(this)
				.style('fill', function() {
					return selected;
				})
				.style('stroke-width', 1);
			drawLine(d);
			drawTooltip(d, 'mdl');
		})
		.on('mouseout', function(d) {
			svg.selectAll('.trendline').remove();
			svg.selectAll('.tooltip').remove();
			d3.select(this)
				.style('fill', function(d) { 
					if (selectedCountry === d.country) {
						return highlight;
					}
					return text_color;
				})
				.style('stroke-width', 0);
		});

		// recolor and resize
		mdl_circles
			.style("opacity", 0.7)
			.attr('r', function(d) {
				if (showSize) {
					return r(d.mdl_num_ratings);
				}
				return rad;
			})
			.style('fill', function(d) { 
				if (selectedCountry === d.country) {
					return highlight;
				}
				return text_color;
			});

		// DOUBAN
		var db_circles = svg.selectAll('.db_circle')
			.data(allData, function(d) { return 'db' + d.id; });
		
		db_circles.enter().append('circle')
			.attr('class', 'db_circle')
			.style("opacity", 0.7)
			.attr('r', function(d) {
				if (showSize) {
					return r(d.db_num_ratings);
				}
				return rad;
			})
			.style('fill', function(d) { 
				if (selectedCountry === d.country) {
					return highlight;
				}
				return text_color;
			})
			.attr('cx', function(d) { return x(d.id % COLS) + DB_SHIFT; })
			.attr('cy', function(d) { return y(d.db_rating); })

			.on('mouseover', function(d) {
				d3.select(this)
					.style('fill', function() {
						return selected;
					})
					.style('stroke-width', 1);
				drawLine(d);
				drawTooltip(d, 'db');
			})
			.on('mouseout', function(d) {
				svg.selectAll('.trendline').remove();
				svg.selectAll('.tooltip').remove();
				d3.select(this)
					.style('fill', function(d) { 
						if (selectedCountry === d.country) {
							return highlight;
						}
						return text_color;
					})
					.style('stroke-width', 0);
			});


		db_circles
			.style("opacity", 0.7)
			.attr('r', function(d) {
				if (showSize) {
					return r(d.db_num_ratings);
				}
				return rad;
			})
			.style('fill', function(d) { 
				if (selectedCountry === d.country) {
					return highlight;
				}
				return text_color;
			});
	}

	function drawLine(d) {
		svg.append('line')
			.style('stroke', function() {
				return selected;
			})
			.style("stroke-dasharray", ("2, 2"))
			.style('stroke-width', 2)
			.style("opacity", 0.7)
			.attr('class', 'trendline')
			.attr('x1', x(d.id % COLS))
			.attr('y1', y(d.mdl_rating))
			.attr('x2', x(d.id % COLS) + DB_SHIFT)
			.attr('y2', y(d.db_rating));
	}

	function drawLines(country) {
		svg.selectAll('.countryline').remove();

		var countryData = allData.filter(d => d.country === country);
		var lines = svg.selectAll('.countryline')
			.data(countryData);

		lines.enter().append('line')
			.style('stroke', function() {
				return highlight;
			})
			.style("stroke-dasharray", ("2, 2"))
			.style('stroke-width', 2)
			.style("opacity", 0.4)
			.attr('class', 'countryline')
			.attr('x1', function(d) { return x(d.id % COLS); })
			.attr('y1', function(d) { return y(d.mdl_rating); })
			.attr('x2', function(d) { return x(d.id % COLS) + DB_SHIFT; })
			.attr('y2', function(d) { return y(d.db_rating); })
				.exit().remove(); // not sure how to use exit welp
	}

	function drawTooltip(d, source) {
		var tooltip = svg.append('g')
			.attr('class', 'tooltip');
		styleTooltip(tooltip, d, source);
		repositionTooltip(d);
	}

	function drawFrames() {
		svg.selectAll('.frame').remove();

		axis_mdl = d3.line()([
			[85, buf], 
			[85, plotHeight - buf + 10],
			[85 + subwidth + 30, plotHeight - buf + 10],
			[85 + subwidth + 30, buf],
			[85, buf]]);
		svg.append('path')
			.attr('class', 'frame')
			.attr('d', axis_mdl)
			.attr('stroke', text_color)
			.attr('fill', 'none');
		svg.append('text')
			.attr('class', 'frame')
			.attr('fill', text_color)
			.attr('x', 85 + subwidth / 3)
			.attr('y', plotHeight - buf)
			.text('MyDramaList');

		axis_db = d3.line()([
			[85 + DB_SHIFT, buf], 
			[85 + DB_SHIFT , plotHeight - buf + 10],
			[85 + subwidth + 30 + DB_SHIFT, plotHeight - buf + 10],
			[85 + subwidth + 30 + DB_SHIFT, buf],
			[85 + DB_SHIFT, buf]]);
		svg.append('path')
			.attr('class', 'frame')
			.attr('d', axis_db)
			.attr('stroke', text_color)
			.attr('fill', 'none');
		svg.append('text')
			.attr('class', 'frame')
			.attr('fill', text_color)
			.attr('x', 85 + subwidth / 3 + DB_SHIFT + 20)
			.attr('y', plotHeight - buf)
			.text('Douban');
	}

	function repositionTooltip(d) {
		var line_height = 16;
		var gap = 10;
		var x = d3.mouse(document.getElementById('compare'))[0];
		var y = d3.mouse(document.getElementById('compare'))[1];

		svg.selectAll('rect.tooltip')
			.attr('x', x + gap)
			.attr('y', y + gap);

		svg.selectAll('text.tooltip')
			.attr('x', x + gap + 10)
			.attr('y', y + gap + 20);

		svg.selectAll('tspan')
			.attr('x', x + gap + 10);
	}

	function styleTooltip(tooltip, d, source) {
		var line_height = 16;
		var tooltip_width = 150;
		var tooltip_height = line_height * 4;

		// bigger box for dramas with more text
		if (d.name.length > 20) {
			tooltip_width = 200;
		}

		tooltip.append('rect')
			.attr('class', 'tooltip')
			.attr('fill', 'black')
			.attr('opacity', 0.5)
			.attr('width', tooltip_width)
			.attr('height', tooltip_height)
			.attr('rx', 5)
			.attr('ry', 5);

		var textbase = tooltip.append('text')
			.attr('class', 'tooltip')
			.attr('id', 'textbase')
			.attr('fill', text_color);
		
		textbase.append('tspan')
			.text(d.name);
		
		if (source === 'db') {
			textbase.append('tspan')
				.attr('dy', line_height)
				.text('Rating: ' + d.db_rating);
			textbase.append('tspan')
				.attr('dy', line_height)
				.text('Scored by ' + d.db_num_ratings + ' users');
		} else {
			textbase.append('tspan')
				.attr('dy', line_height)
				.text('Rating: ' + d.mdl_rating);
			textbase.append('tspan')
				.attr('dy', line_height)
				.text('Scored by ' + d.mdl_num_ratings + ' users');
		}

	}
}