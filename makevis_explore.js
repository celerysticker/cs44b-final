makeExplore();

function makeExplore() {
	// ========== CONSTANTS ==========
	var COLS = 15;

	var text_color = '#bbbbbb';
	var highlight = '#f7cb38ff';
	var selected = '#f73859ff';

	var countries = ['China', 'South Korea', 'Japan', 'Taiwan', 'Thailand'];
	var genres = [
		'Action', 'Comedy','Family', 'Fantasy',
		'Friendship','Historical', 'Investigation', 
		'Medical', 'Mystery', 'Political', 'Romance', 
		'School', 'Thriller', 'Youth']

	var tags_male_lead = [
		{'key': 'Smart Male Lead', 'value': 20},
		{'key': 'Strong Male Lead', 'value': 16},
		{'key': 'Nice Male Lead', 'value': 15},
		{'key': 'Hardworking Male Lead', 'value': 4}
	]

	var tags_female_lead = [
		{'key': 'Smart Female Lead', 'value': 16},
		{'key': 'Strong Female Lead', 'value': 42},
		{'key': 'Nice Female Lead', 'value': 1},
		{'key': 'Hardworking Female Lead', 'value': 7},
	]

	var tags_adapted = [
		{'key': 'Adapted From A Novel', 'value': 27},
		{'key': 'Adapted From A Webtoon', 'value': 5},
		{'key': 'Adapted From A Web Novel', 'value': 3},
		{'key': 'Adapted From A Manhwa', 'value': 2},
		{'key': 'Adapted From A Manga', 'value': 1}
	]

	var tags_romance = [
		{'key': 'Love Triangle', 'value': 13},
		{'key': 'Gay Relationship', 'value': 9}
	]

	var tags_friendship = [
		{'key': 'Strong Friendship', 'value': 6},
		{'key': 'Bromance', 'value': 23},
		{'key': 'Sismance', 'value': 10},
	]

	var tags_chase = [
		{'key': 'Male Chases Female First', 'value': 12},
		{'key': 'Female Chases Male First', 'value': 3},
	]

	var tags_plot = [
		{'key': 'Cohabitation', 'value': 6},
		{'key': 'College Life', 'value': 8},
		{'key': 'Hidden Identity', 'value': 11},
		{'key': 'High School', 'value': 8},
		{'key': 'Murder', 'value': 9},
		{'key': 'Power Struggle', 'value': 13},
		{'key': 'Revenge', 'value': 11},
		{'key': 'Time Travel', 'value': 8},
		{'key': 'Tragic Past', 'value': 11},
		{'key': 'Trauma', 'value': 13}
	]


	// ========== CONTROLS ===========
	var selectedId = null;

	var selectedCountry = '';
	var selectedAdapt = '';
	var selectedGenres = [];
	var selectedFemaleLeads = [];
	var selectedMaleLeads = [];
	var selectedRomance = [];
	var selectedFriendships = [];
	var selectedChase = '';
	var selectedPlots = [];
	var selectedTags = [];

	// ======== CHARTS ===============
	var plotHeight = 1000;
	var plotWidth = 600;
	var buf = 60;

	var allData;

	// add an SVG element to the DOM
	var svg = d3.select('svg#explore')
		.attr('width', plotWidth)
		.attr('height', plotHeight - buf);
	var posters = d3.select('#posters');

	// load data
	d3.csv('data/mdl_douban_data_100_min_img.csv', function(d, i) {
		return {
			id: +i,
			name: d.name,
			country: d.country,
			// split and trim whitespace
			// TODO: do this for raw dataset instead
			genres: d.genres.split(",").map(s => s.trim())
				.filter(function(g) {
					return g != ''
				}),
			tags: d.mdl_tags.split(",").map(s => s.trim())
				.filter(function(g) {
					return g != ''
				}),
			mdl_rating: +d.mdl_rating,
			mdl_num_ratings: +d.mdl_num_ratings,
			db_rating: +d.db_rating,
			db_num_ratings: +d.db_num_ratings,
			image_path: d.image_path
		}
	}).then(function(data) {
		allData = data;
		drawDramas('');
		drawCharts();
	});

	function drawCharts() {
		svg.selectAll('*').remove();
		drawCountries();
		drawGenres();
		drawLeads();
		drawRomance();
		drawFriendship();
		drawPlot();
		drawAdapted();
		drawChase();
	}

	function drawCountries() {
		var OFFSET_Y = 50;
		var OFFSET_X = 0;
		var barHeight = 100;
		var barWidth = 250;
		var barBuf = 10;
		var maxVal = 90;
		var kw = 'country';

		var country_count = nestByCountry();

		drawVerticalBarChart(
			country_count, 
			kw, 
			OFFSET_Y, OFFSET_X, barWidth, barHeight, barBuf, maxVal);
	}

	function drawGenres() {
		var OFFSET_Y = 220;
		var OFFSET_X = 50;
		var barHeight = 100;
		var barWidth = 400;
		var barBuf = 10;
		var maxVal = 90;
		var kw = 'genre';

		var genre_count = countByGenre();

		drawVerticalBarChart(
			genre_count, 
			kw, 
			OFFSET_Y, OFFSET_X, barWidth, barHeight, barBuf, maxVal);
	}

	function drawRomance() {
		var OFFSET_Y = 560;
		var OFFSET_X = 120;
		var barWidth = 60;
		var barHeight = 60;
		var barBuf = 10;
		var kw = 'romance';

		drawHorizontalBarChart(
			tags_romance, 
			kw, 
			OFFSET_Y, OFFSET_X, barWidth, barHeight, barBuf);
	}

	function drawFriendship() {
		var OFFSET_Y = 620;
		var OFFSET_X = 120;
		var barWidth = 60;
		var barHeight = 80;
		var barBuf = 10;
		var line_height = 11;
		var kw = 'friendship';

		drawHorizontalBarChart(
			tags_friendship, 
			kw, 
			OFFSET_Y, OFFSET_X, barWidth, barHeight, barBuf);
	}

	function drawPlot() {
		var OFFSET_Y = 730;
		var OFFSET_X = 50;
		var barHeight = 50;
		var barWidth = 400;
		var barBuf = 10;
		var maxVal = 15;
		var kw = 'plot';

		drawVerticalBarChart(
			tags_plot, 
			kw, 
			OFFSET_Y, OFFSET_X, barWidth, barHeight, barBuf, maxVal);
	}

	function drawAdapted() {
		var OFFSET_X = 400;
		var OFFSET_Y = 120;
		var radius = 50;
		var kw = 'adapted'

		drawPie(tags_adapted, 
			'adapted',
			OFFSET_X, OFFSET_Y, radius);
		return;
	}

	function drawChase() {
		var OFFSET_X = 370;
		var OFFSET_Y = 620;
		var radius = 50;
		var kw = 'chase'

		drawPie(tags_chase, 
			'chase',
			OFFSET_X, OFFSET_Y, radius);
		return;
	}

	function drawLeads() {
		var FEMALE_LEADS_OFFSET_X = 0;
		var MALE_LEADS_OFFSET_X = 300;
		var LEADS_OFFSET_Y = 370;
		var line_height = 15;

		var vbarWidth = 200;
		var vbarHeight = 400;
		var vbarBuf = 60;

		vbar_x = d3.scaleLinear()
			.domain([0, 50])
			.range([0, vbarWidth - buf]);

		vbar_y = d3.scaleBand()
			.domain([0, 1, 2, 3])
			.range([vbarBuf, vbarWidth - vbarBuf])
			.padding([0.2]);

		// draw labels
		var leads_labels = ['Smart', 'Strong', 'Nice', 'Hardworking']
		svg.selectAll('.lead_text')
			.data(leads_labels)
			.enter().append('text')
				.attr("text-anchor", "middle")
				.attr('class', 'lead_text')
				.attr('fill', text_color)
			    .attr('x', FEMALE_LEADS_OFFSET_X + vbarWidth + 50) // wow sorry for this hardcoding
			    .attr('y', function(d, i) {
			    	return vbar_y(i) + LEADS_OFFSET_Y + line_height;
			    })
			    .text(function(d) {
			    	return d;
			    });

		svg.append('text')
			.attr('text-anchor', 'end')
			.attr('class', 'lead_text')
			.attr('fill', text_color)
			.attr('x', FEMALE_LEADS_OFFSET_X + vbarWidth)
			.attr('y', LEADS_OFFSET_Y + vbar_y(0) - line_height)
			.text('Female Lead');
		svg.append('text')
			.attr('text-anchor', 'start')
			.attr('class', 'lead_text')
			.attr('fill', text_color)
			.attr('x', MALE_LEADS_OFFSET_X)
			.attr('y', LEADS_OFFSET_Y + vbar_y(0) - line_height)
			.text('Male Lead');

		// draw bars
		var maleLeadData = svg.selectAll('.bar_male_lead')
			.data(tags_male_lead);
		
		var maleLeadBars = maleLeadData.enter().append('rect')
			.attr('class', 'bar_male_lead')
			.attr('id', function(d, i) {
				return 'bar_male_lead_' + i;
			})
			.attr('fill', text_color)
			.attr('x', MALE_LEADS_OFFSET_X)
			.attr('width', function(d) {
				return vbar_x(d.value);
			})
			.attr('y', function(d, i) { 
				return vbar_y(i) + LEADS_OFFSET_Y;
			})
			.attr('height', vbar_y.bandwidth)
		
		maleLeadData.enter().append('text')
				.attr('class', 'text_male_lead')
				.attr('alignment-baseline', 'middle')
				.attr('fill', text_color)
				.attr('x', function(d) { return MALE_LEADS_OFFSET_X + vbar_x(d.value) + 10; })
				.attr('y', function(d, i) { return vbar_y(i) + LEADS_OFFSET_Y + vbar_y.bandwidth() / 2; })
				.text(function(d) { return  d.value });

		maleLeadBars
			.style('fill', function(d) { 
				if (selectedTags.includes(d.key)) {
					return highlight;
				}
				return text_color; 
			})
			.on('mouseover', function(d, i) {
				svg.selectAll('#bar_male_lead_' + i)
					.style('fill', function(d) {
						return selected;
					});
			})
			.on('mouseout', function(d) {
				svg.selectAll('.bar_male_lead')
					.style('fill', function(d) { 
						if (selectedTags.includes(d.key)) {
							return highlight;
						}
						return text_color; 
					});
			})
			.on('click', function(d) {
				updateSelectedTags(d.key);
				drawCharts();
				drawDramas();
			});

		var femaleLeadData = svg.selectAll('.bar_female_lead')
			.data(tags_female_lead);

		var femaleLeadBars = femaleLeadData.enter().append('rect')
			.style('fill', function(d) { 
				if (selectedTags.includes(d.key)) {
					return highlight;
				}
				return text_color; 
			})
			.attr('class', 'bar_female_lead')
			.attr('id', function(d, i) {
				return 'bar_female_lead_' + i;
			})
			.attr('x', function(d) {
				return FEMALE_LEADS_OFFSET_X + vbarWidth - vbar_x(d.value);
			})
			.attr('width', function(d) {
				return vbar_x(d.value);
			})
			.attr('y', function(d, i) { 
				return vbar_y(i) + LEADS_OFFSET_Y;
			})
			.attr('height', vbar_y.bandwidth);

		femaleLeadData.enter().append('text')
			.attr('class', 'text_female_lead')
			.attr('alignment-baseline', 'middle')
			.attr('fill', text_color)
		    .attr('x', function(d) { return FEMALE_LEADS_OFFSET_X + vbarWidth - vbar_x(d.value) - 20; })
		    .attr('y', function(d, i) { return vbar_y(i) + LEADS_OFFSET_Y + vbar_y.bandwidth() / 2; })
		    .text(function(d) { return d.value });

		femaleLeadBars
			.on('mouseover', function(d, i) {
				svg.selectAll('#bar_female_lead_' + i)
					.style('fill', selected);
			})
			.on('mouseout', function(d) {
				svg.selectAll('.bar_female_lead')
					.style('fill', function(d) { 
						if (selectedTags.includes(d.key)) {
							return highlight;
						}
						return text_color; 
					});
			})
			.on('click', function(d) {
				updateSelectedTags(d.key);
				drawCharts();
				drawDramas();
			});

	}

	// referenced:
	// https://bl.ocks.org/DDDDDanica/661e8bb2ddd79b7bc4cf790ef4f1f648
	function drawPie(tags_data, kw, OFFSET_X, OFFSET_Y, radius) {
		var pie = d3.pie()
			.value(d => d.value)
			.padAngle([0.05]);

		var arc = d3.arc()
	        .innerRadius(radius * 0.5)
	        .outerRadius(radius);

		var arcs = pie(tags_data);

		var t_x = OFFSET_X;
		var t_y = OFFSET_Y;
		var t_str = 'translate(' + t_x.toString() + ',' + t_y.toString() + ')';

		var arcs = svg.selectAll('.pie' + kw)
			.data(arcs)
			.enter().append('g')
				.attr('class', 'arc')
				.attr('transform', t_str);

		var slices = arcs.append('path')
			.attr('class', 'pie_' + kw)
			.attr('id', function(d, i) {
				return 'pie_' + kw + i;
			})
			.attr('fill', function(d) {
				if (selectedTags.includes(d.data.key)) {
					return highlight;
				}
				return text_color; 
			})
			.attr('stroke', text_color)
			.attr('stroke-width', '2px')
			.attr('stroke-opacity', '0')
			.attr('d', arc);

		slices
			.on('mouseover', function(d, i) {
				svg.selectAll('#pie_' + kw + i)
					.style('fill', selected);
			})
			.on('mouseout', function(d) {
				svg.selectAll('.pie_' + kw)
					.style('fill', function(d) {
						if (selectedTags.includes(d.data.key)) {
							return highlight;
						}
						return text_color; 
				});
			})
			.on('click', function(d) {
				updateSelectedTags(d.data.key);
				drawCharts();
				drawDramas();
			});

		var r = radius + 10;
		var inner_r = 10; // line's distance from outer edge
		var outer_r = 20; // label's distance from outer edge
		var pie_start = ['Adapted From A Novel', 'Adapted From A Manga']
		arcs.append('text')
			.attr('text-anchor', function(d) {
				// hello hardcoding
				if (pie_start.includes(d.data.key)) {
					return 'start';
				}
				return 'end';
			})
			.attr('fill', text_color)
			.attr("x", function(d) {
				var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
				d.cx = Math.cos(a) * (r - inner_r);
				return d.x = Math.cos(a) * (r + outer_r);
			})
			.attr("y", function(d) {
				var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
				d.cy = Math.sin(a) * (r - inner_r);
				return d.y = Math.sin(a) * (r + outer_r);
			})
			.text(function(d) {
				var label = d.data.key.replace('Adapted From A ', '');
				return label + ' (' + d.data.value + ')';
			})
			.each(function(d) {
				var bbox = this.getBBox();
				d.x = d.x + 15;
				if (pie_start.includes(d.data.key)) {
					d.sx = d.x + bbox.width - 10;
					d.ox = d.sx + 10;
				} else {
					d.sx = d.x - 10;
					d.ox = d.x;
				}
				d.sy = d.oy = d.y - 2.5;
    		});

		arcs.append("path")
			.style("fill", "none")
			.style("stroke", text_color)
			.style('stroke-width', 1)
			.attr("d", function(d) {
				return "M" + d.sx + "," + d.sy + "L" + d.ox + "," + d.oy + " " + d.cx + "," + d.cy;
			});

	}

	function drawHorizontalBarChart(tags_data, kw, OFFSET_Y, OFFSET_X, barWidth, barHeight, barBuf) {
		var labels = tags_data.map(item => item.key);
		x = d3.scaleLinear()
			.domain([0, 15])
			.range([barBuf, barWidth - barBuf, ]);
		y = d3.scaleBand()
			.domain(labels)
			.range([barBuf, barHeight- barBuf])
			.padding([0.2]);

		var line_height = y.bandwidth() / 2;

		var barData = svg.selectAll('.bar_' + kw)
			.data(tags_data);

		var bars = 
			barData.enter().append('rect')
				.style('fill', function(d) { 
					if (selectedTags.includes(d.key)) {
						return highlight;
					}
					return text_color; 
				})
				.attr('class', 'bar_' + kw)
				.attr('id', function(d, i) {
					return 'bar_' + kw + i;
				})
				.attr('x', OFFSET_X)
				.attr('width', function(d) {
					return x(d.value);
				})
				.attr('y', function(d, i) { 
					return y(d.key) + OFFSET_Y;
				})
				.attr('height', y.bandwidth)

		// TODO: numbers should change on hover too
		barData.enter().append('text')
			.attr('alignment-baseline', 'middle')
			.attr('class', 'text_' + kw)
		    .attr('fill', text_color)
		    .attr('x', function(d) {
		    	return x(d.value) + OFFSET_X + 10;
			})
		    .attr('y', function(d) {
		    	return y(d.key) + OFFSET_Y + line_height;
			})
		    .text(function(d) { return d.value; });


		bars
			.on('mouseover', function(d, i) {
				svg.selectAll('#bar_' + kw + i)
					.style('fill', selected);
			})
			.on('mouseout', function(d) {
				svg.selectAll('.bar_' + kw)
					.style('fill', function(d) {
						if (selectedTags.includes(d.key)) {
							return highlight;
						}
						return text_color; 
					});
			})
			.on('click', function(d) {
				updateSelectedTags(d.key);
				drawCharts();
				drawDramas();
			});

		// labels
		svg.selectAll('.label_' + kw)
			.data(labels)
			.enter().append('text')
				.attr('text-anchor', 'end')
				.attr('alignment-baseline', 'middle')
				.attr('class', 'label_' + kw)
				.attr('fill', text_color)
			    .attr('x', OFFSET_X - 10) // hardcoding cry
			    .attr('y', function(d) {
			    	return y(d) + OFFSET_Y + line_height;
			    })
			    .text(function(d) {
			    	return d;
			    });
	}

	function drawVerticalBarChart(tags_data, kw, OFFSET_Y, OFFSET_X, barWidth, barHeight, barBuf, maxVal) {
		var labels = tags_data.map(item => item.key);
		var x = d3.scaleBand()
			.domain(labels)
			.range([barBuf, barWidth- barBuf])
			.padding([0.2]);
		var y = d3.scaleLinear()
			.domain([0, maxVal])
			.range([barBuf, barHeight - barBuf, ]);

		var line_height = x.bandwidth() / 2;

		var barData = svg.selectAll('.bar_' + kw)
			.data(tags_data);

		var bars = 
			barData.enter().append('rect')
				.style('fill', function(d) { 
					if (selectedTags.includes(d.key)) {
						return highlight;
					}
					return text_color; 
				 })
				.attr('class', 'bar_' + kw)
				.attr('id', function(d, i) {
					return 'bar_' + kw + i;
				})
				.attr('x', function(d) { 
					return x(d.key) + OFFSET_X;
				})
				.attr('width', x.bandwidth)
				.attr('y', function(d) {
					return OFFSET_Y + (barHeight - y(d.value));
				})
				.attr('height', function(d) {
					return y(d.value);
				});
		
		barData.enter().append('text')
			.attr('text-anchor', 'middle')
			.attr('alignment-baseline', 'middle')
			.attr('class', 'text_' + kw)
		    .attr('fill', text_color)
		    .attr('x', function(d) {
		    	return OFFSET_X + x(d.key) + line_height;
			})
		    .attr('y', function(d) {
		    	return OFFSET_Y + (barHeight - y(d.value)) - line_height;
			})
		    .text(function(d) { return d.value; });


		bars
			.on('mouseover', function(d, i) {
				svg.selectAll('#bar_' + kw + i)
					.style('fill', selected);
			})
			.on('mouseout', function(d) {
				svg.selectAll('.bar_' + kw)
					.style('fill', function(d) {
						if (selectedTags.includes(d.key)) {
							return highlight;
						}
						return text_color; 
					});
			})
			.on('click', function(d) {
				updateSelectedTags(d.key);
				drawCharts();
				drawDramas();
			});

		// axis
		var t_x = OFFSET_X;
		var t_y = OFFSET_Y + barHeight;
		var t_str = 'translate(' + t_x.toString() + ',' + t_y.toString() + ')';

		svg.selectAll('#axis_label_' + kw).remove();
		svg.append('g')
			.attr('id', 'axis_label_' + kw)
			.attr('transform', t_str)
			.call(d3.axisBottom(x))
				.selectAll("text") 
		        .style("text-anchor", "end")
		        .attr("dx", "-.8em")
		        .attr("dy", ".15em")
		        .attr("transform", "rotate(-65)");
	}

	function nestByCountry() {
		var countryCount = d3.nest()
			.key(function(d) { return d.country; })
			.rollup(function(v) { return v.length; })
			.entries(allData);
		return countryCount;
	}

	function countByGenre() {
		var genreCount = []
		genres.forEach( function(genre) {
			genreCount.push({'key': genre, 'value': 0})
		});
		for (var i = 0; i < allData.length; i++) {
			genres.forEach(function (genre) {
				if (allData[i].genres.includes(genre)) {
					genreCount[genres.indexOf(genre)].value++;
				}
			});
		}
		return genreCount;
	}

	// ========== POSTERS =============
	function drawDramas() {
		var country;
		var genre;

		var dramaData = posters.selectAll('.drama_poster')
			.data(allData, function(d) { return d.id; })
		var dramas = dramaData
			.enter().append('img')
				.attr('src', function(d) {
					return 'img/' + d.image_path;
				})
				.attr('id', function(d) { 
					return 'img_' + d.id.toString(); 
				})
				.attr('class', 'drama_poster')
				.attr('width', '50px')
				.style('opacity', function(d) {
					return '0.3';
				});

		// update the opacity
		dramaData.style('opacity', function(d) {
			if (d.id == selectedId) {
				return 1;
			}
			else if (hasAllSelectedTags(d)) {
				return 1;
			}
			return 0.3;
		});

		d3.selectAll('.drama_poster')
			.on('mouseover', function(d) {
				d3.select(this).style('opacity', 1);
				tippy(d3.select(this).nodes(), { 
					allowHTML: true,
					content: getTooltipHtml(d),
					delay: [200, 100],
					interactive: true,
					maxWidth: 250,
					placement: 'right',
					theme: 'cinema'
				});
			})
			.on('mouseout', function() {
				drawDramas();
			})
			.on('click', function(d) {
				selectedCountry = d.country;
				selectedAdapt = getIntersectTags(tags_adapted, d.tags);
				selectedGenres = d.genres;
				selectedFemaleLeads = getIntersectTags(tags_female_lead, d.tags);
				selectedMaleLeads = getIntersectTags(tags_male_lead, d.tags);
				selectedRomance = getIntersectTags(tags_romance, d.tags);
				selectedFriendships = getIntersectTags(tags_friendship, d.tags);
				selectedChase = getIntersectTags(tags_chase, d.tags);
				selectedPlots = getIntersectTags(tags_plot, d.tags);

				selectedTags = [].concat(
					selectedCountry,
					selectedAdapt,
					selectedGenres,
					selectedFemaleLeads,
					selectedMaleLeads,
					selectedRomance,
					selectedFriendships,
					selectedChase,
					selectedPlots);

				selectedId = d.id;
				drawCharts();
			});
	}

	function getIntersectTags(tags_data, all_tags) {
		var labels = tags_data.map(item => item.key);
		return labels.filter(x => all_tags.includes(x));
	}

	function getTooltipHtml(d) {
		var html = d.name
			+ '<br>Country: ' + d.country
			+ '<br>Rating: ' + d.mdl_rating
			+ '<br>Genre: ' + d.genres.join(', ')
			+ '<br>Tags: ' + d.tags.join(', ');
		return html;
	}

	function updateSelectedTags(tag) {
		// if drama is selected, reset everything
		if (selectedId != null) {
			selectedId = null;

			selectedCountry = '';
			selectedAdapt = '';
			selectedGenres = [];
			selectedFemaleLeads = [];
			selectedMaleLeads = [];
			selectedRomance = [];
			selectedFriendships = [];
			selectedChase = '';
			selectedPlots = [];
			selectedTags = [];
		}
		
		// remove tag if tag is already selected
		if (selectedTags.includes(tag)) {
			// single select
			if (selectedCountry === tag) {
				selectedCountry = '';
			} else if (selectedAdapt === tag) {
				selectedAdapt = '';
			} else if (selectedChase === tag) {
				selectedChase = '';
			}

			// multi select
			else if (selectedGenres.includes(tag)) {
				selectedGenres.splice(selectedGenres.indexOf(tag), 1);
			} else if (selectedFemaleLeads.includes(tag)) {
				selectedFemaleLeads.splice(selectedFemaleLeads.indexOf(tag), 1);
			} else if (selectedMaleLeads.includes(tag)) {
				selectedMaleLeads.splice(selectedMaleLeads.indexOf(tag), 1);
			} else if (selectedRomance.includes(tag)) {
				selectedRomance.splice(selectedRomance.indexOf(tag), 1);
			} else if (selectedFriendships.includes(tag)) {
				selectedFriendships.splice(selectedFriendships.indexOf(tag), 1);
			} else if (selectedPlots.includes(tag)) {
				selectedPlots.splice(selectedPlots.indexOf(tag), 1);
			}
		}
		else {
			// single select
			if (countries.includes(tag)) {
				selectedCountry = tag;
			} else if (tags_adapted.map(item => item.key).includes(tag)) {
				selectedAdapt = tag;
			} else if (tags_chase.map(item => item.key).includes(tag)) {
				selectedChase = tag;
			}
			
			// multi select
			else if (genres.includes(tag)) {
				selectedGenres.push(tag);
			} else if (tags_female_lead.map(item => item.key).includes(tag)) {
				selectedFemaleLeads.push(tag);
			} else if (tags_male_lead.map(item => item.key).includes(tag)) {
				selectedMaleLeads.push(tag);
			} else if (tags_romance.map(item => item.key).includes(tag)) {
				selectedRomance.push(tag);
			} else if (tags_friendship.map(item => item.key).includes(tag)) {
				selectedFriendships.push(tag);
			} else if (tags_plot.map(item => item.key).includes(tag)) {
				selectedPlots.push(tag);
			}
		}

		// update
		selectedTags = [].concat(
			selectedCountry,
			selectedAdapt,
			selectedGenres,
			selectedFemaleLeads,
			selectedMaleLeads,
			selectedRomance,
			selectedFriendships,
			selectedChase,
			selectedPlots);

		// remove empty strings
		selectedTags = selectedTags.filter(Boolean);
	}

	function hasAnyTag(d, tags) {
		return tags.includes(d.country) 
			|| d.genres.some(x => tags.includes(x)) 
			|| d.tags.some(x => tags.includes(x));
	}

	function hasAllSelectedTags(d) {
		// dim all posters if nothing is selected
		if (selectedTags.length == 0) {
			return false;
		}
		return (
			(selectedCountry === '' || d.country === selectedCountry)
			&& (selectedAdapt === '' || d.tags.includes(selectedAdapt))
			&& (selectedChase === '' || d.tags.includes(selectedChase))
			&& (selectedGenres.length == 0 || selectedGenres.every(x => d.genres.includes(x)))
			&& (selectedFemaleLeads.length == 0 || selectedFemaleLeads.every(x => d.tags.includes(x)))
			&& (selectedMaleLeads.length == 0 || selectedMaleLeads.every(x => d.tags.includes(x)))
			&& (selectedRomance.length == 0 || selectedRomance.every(x => d.tags.includes(x)))
			&& (selectedFriendships.length == 0 || selectedFriendships.every(x => d.tags.includes(x)))
			&& (selectedPlots.length == 0 || selectedPlots.every(x => d.tags.includes(x)))
		);

	}

}