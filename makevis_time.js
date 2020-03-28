makeTime();

function makeTime() {
	// ========== CONSTANTS ==========
	var text_color = '#bbbbbb';
	var highlight = '#f7cb38ff';
	var highlight_secondary = '#00b8ff';
	var highlight_multiply = '#00ffce';
	var selected = '#f73859ff';

	var line_height = 16;
	var allData;

	// ========== CONTROLS ===========
	var networks_tv = [
		'KBS2', 'SBS', 'MBC', // south korea national tv
		'jTBC', 'tvN', 'OCN', // south korea cable
		'Dragon TV' ,'NTV', 'ZJTV', // china
		'Fuji TV', // japan
		'GMM 25', 'GMM One' // thailand
		];
	var networks_online = [
	'Netflix', 'Viki', // international
	'iQiyi', 'Tencent Video', 'Youku', // china
	'LINE TV', 'CHOCO TV' // taiwan and thailand
	];
	var selectedTv = 'tvN';
	var selectedOnline = 'Netflix';

	d3.selectAll('.chart-text-button')
		.on('mouseover', function() {
			var keyword = d3.select(this).text().trim();
			drawChartWithKeyword(keyword);
		})
		.on('mouseout', function() {
			drawChartWithKeyword('')
		})
		.on('click', function() {
			var keyword = d3.select(this).text().trim();
			// if click same button, unselect
			if (selectedTv === keyword) {
				selectedTv = '';
				d3.select(this).attr('class', 'chart-text-button tv')
				drawChartWithKeyword('');
			}
			else if (selectedOnline === keyword) {
				selectedOnline = '';
				d3.select(this).attr('class', 'chart-text-button online')
				drawChartWithKeyword('');
			}
			// if click different button, update selection
			// if no button is currently selected, update selction
			else {
				if (networks_tv.includes(keyword)) {
					d3.selectAll('.chart-text-button.tv').classed('selected', false);
					d3.select(this).classed('selected', true);
					selectedTv = keyword;
				}
				else if (networks_online.includes(keyword)) {
					d3.selectAll('.chart-text-button.online').classed('selected-secondary', false);
					d3.select(this).classed('selected-secondary', true);
					selectedOnline = keyword;
				}
				drawChartWithKeyword(keyword);		
			}

		});

	function drawChartWithKeyword(keyword) {
		if (networks_tv.includes(keyword)) {
			drawChart(keyword, selectedOnline);
		}
		else if (networks_online.includes(keyword)) {
			drawChart(selectedTv, keyword);
		}
		else {
			drawChart(selectedTv, selectedOnline);
		}
	}

	// ========== CHART =============
	var plotWidth = 1000;
	var plotHeight = 600;
	var buf = 60;
	var bufRight = 150;

	var x = d3.scaleTime()
		.domain([new Date("2009-06-01"), new Date("2020-06-01")])
		.range([buf, plotWidth - buf - bufRight]);
	var y = d3.scaleLinear()
		.domain([8, 9.6])
		.range([plotHeight - buf, buf]);
	var r = d3.scaleLinear()
		.domain([0, 50000])
		.range([0, 50]);

	// add an SVG element to the DOM
	var svg = d3.select('#time')
		.attr('width', plotWidth)
		.attr('height', plotHeight);

	// draw axis
	svg.append('g')
		.attr('transform', 'translate(60,0)')
		.call(d3.axisLeft(y))
		.append('text')
			.attr('fill', text_color)
			.attr('transform','translate(-40, 270)rotate(270)')
			.text('MDL Rating');
	svg.append('g')
		.attr('transform', 'translate(0,540)')
		.call(d3.axisBottom(x))
		.append('text')
			.attr('fill', text_color)
			.attr('transform','translate(500, 40)')
			.text('Air Date');

	// draw legend
	var legend_sizes = [5000, 10000, 25000]
	var legend_position = [0, 50, 120]
	var legend_center = plotWidth - (buf + bufRight) * 0.5;
	var legend_width = 50;
	var legend_top = 150;
	var legend_height = 180;

	var legend = svg.append('g');

	legend.selectAll('.legend_circ')
		.data(legend_sizes).enter().append('circle')
			.attr('class', 'legend_circ')
			.attr('cx', legend_center)
			.attr('cy', function(d, i) { 
				return legend_top + legend_position[i];
			})
			.attr('r', function(d) { return r(d); })
			.style('fill', text_color)
			.style('fill-opacity', 0.3)
			.style('stroke', text_color)
			.style('stroke-opacity', 1)
			.style('stroke-width', 1);

	var legend_frame = d3.line()([
		[legend_center - legend_width, legend_top], 
		[legend_center - legend_width, legend_top + legend_height],
		[legend_center + legend_width, legend_top + legend_height],
		[legend_center + legend_width, legend_top],
		[legend_center - legend_width, legend_top]]);

	legend.append('text')
		.attr('text-anchor', 'middle')
		.attr('alignment-baseline', 'middle')
		.attr('fill', text_color)
		.attr('x', legend_center)
		.attr('y', legend_top + legend_height)
		.text('Number of Ratings');
	legend.selectAll('.legend_text')
		.data(legend_sizes).enter()
		.append('text')
		.attr('class', 'legend_text')
		.attr('text-anchor', 'middle')
		.attr('alignment-baseline', 'middle')
		.attr('fill', text_color)
		.attr('x', legend_center)
		.attr('y', function(d, i) { 
			return legend_top + legend_position[i] + r(d) + 12;
		})
		.text(function(d) { return d });

	// load data
	d3.csv('data/mdl_data_500_min.csv', function(d, i) {
		return {
			id: +i,
			name: d.name,
			air_start: getAirStart(d.air_dates),
			country: d.country,
			networks: d.original_network.split(",").filter(function(g) {
				return g != ''
			}),
			mdl_rating: +d.mdl_rating,
			mdl_num_ratings: +d.mdl_num_ratings,
		}
	}).then(function(data) {
		allData = data;
		drawChart(selectedTv, selectedOnline);
	});

	function drawChart(tv, online) {
		// sort data so that small circles are drawn on top
		var circles = svg.selectAll('.circle')
			.data(allData.sort(function(x, y) {
					return d3.descending(x.mdl_num_ratings, y.mdl_num_ratings);
				}), function(d) { return d.id; });

		circles
			.enter().append('circle')
				.attr('class', 'circle')
				.attr('cx', function(d) { return x(d.air_start); })
				.attr('cy', function(d) { return y(d.mdl_rating); })
				.attr('r', function(d) { return r(d.mdl_num_ratings); })
				.style("opacity", 0.5)
				.style('fill', function(d) {
					if (d.networks.includes(tv) && d.networks.includes(online)) {
						return highlight_multiply;
					}
					else if (d.networks.includes(tv)) {
						return highlight;
					}
					else if (d.networks.includes(online)) {
						return highlight_secondary;
					}
					else {
						return text_color;
					}
				})

				.on('mouseover', function(d) {
					d3.select(this).style('fill', selected);
					var tooltip = svg.append('g').attr('class', 'tooltip');
					styleTooltip(tooltip, d);
					repositionTooltip(d);
				})
				.on('mousemove', repositionTooltip)
				.on('mouseout', function(d) {
					d3.select(this).style('fill', function(d) {
						if (d.networks.includes(selectedTv) && d.networks.includes(selectedOnline)) {
							return highlight_multiply;
						}
						else if (d.networks.includes(selectedTv)) {
							return highlight;
						}
						else if (d.networks.includes(selectedOnline)) {
							return highlight_secondary;
						}
						else {
							return text_color;
						}
					});
					svg.selectAll('.tooltip').remove();
				});

		// recolor
		circles
		.style('fill', function(d) {
			if (d.networks.includes(tv) && d.networks.includes(online)) {
				return highlight_multiply;
			}
			else if (d.networks.includes(tv)) {
				return highlight;
			}
			else if (d.networks.includes(online)) {
				return highlight_secondary;
			}
			else {
				return text_color;
			}
		});

		if (online === 'Netflix') {
			drawNetflixAnnotation();
		}
		else {
			svg.selectAll('#netflix').remove();
		}
	}

	function repositionTooltip(d) {
		var gap = 10;
		var x = d3.mouse(document.getElementById('time'))[0];
		var y = d3.mouse(document.getElementById('time'))[1];

		svg.selectAll('rect.tooltip')
		.attr('x', x + gap)
		.attr('y', y + gap);

		svg.selectAll('text.tooltip')
		.attr('x', x + gap + 10)
		.attr('y', y + gap + 20);

		svg.selectAll('tspan')
		.attr('x', x + gap + 10);
	}

	function styleTooltip(tooltip, d) {
		var tooltip_width = 160;
		var tooltip_height = line_height * 5;
		var networks_list = d.networks.join(', ');

		// bigger box for dramas with more text
		if (networks_list.length > 25) {
			tooltip_width = 250;
		} else if (d.name.length > 20 || networks_list.length > 15) {
			tooltip_width = 200;
		} 

		tooltip.append('rect')
			.attr('class', 'tooltip')
			.attr('fill', 'black')
			.attr('opacity', 0.8)
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

		textbase.append('tspan')
			.attr('dy', line_height)
			.text('Network(s): ' + networks_list);
		textbase.append('tspan')
			.attr('dy', line_height)
			.text('Rating: ' + d.mdl_rating);
		textbase.append('tspan')
			.attr('dy', line_height)
			.text('Scored by ' + d.mdl_num_ratings + ' users');
	}

	function drawNetflixAnnotation() {
		svg.selectAll('#netflix').remove();

		var parseTime = d3.timeParse('%b %d, %Y');
		var first_show = parseTime('Jan 5, 2017')
		svg.append('line')
			.attr('id', 'netflix')
			.attr('stroke', text_color)
			.style("stroke-dasharray", ("3, 3"))
			.attr('x1', x(first_show))
			.attr('y1', buf + 20)
			.attr('x2', x(first_show))
			.attr('y2', plotHeight - buf);
		
		svg.append('text')
			.attr('id', 'netflix')
			.attr('fill', text_color)
			.attr('x', x(first_show) + 10)
			.attr('y', buf + 30)
			.text('◀ Netflix optioned its first');

		svg.append('text')
			.attr('id', 'netflix')
			.attr('fill', text_color)
			.attr('x', x(first_show) + 10)
			.attr('y', buf + 45)
			.text('Korean drama in 2017');
	}

	function getAirStart(air_dates) {
		var parseTime = d3.timeParse('%b %d, %Y');
		return parseTime(air_dates.split('-')[0].trim());
	}
}