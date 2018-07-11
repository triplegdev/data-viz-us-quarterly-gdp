var w = 800;
	var h = 400;
	var barWidth = w / 275;
	var dataset;

	var tooltip = d3.select(".svgContainer")
                    .append("div")
                    .attr("id", "tooltip")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

	var svg = d3.select(".svgContainer")
	            .append("svg")
	            .attr('viewBox', '0 0 ' + (w+100) + ' ' + (h+60))
	            .attr('preserveAspectRato', "xMidYMid meet")
	            .classed("svg-content", true);

	d3.json("data/gdp.json").then(function(datakey) {
	 	dataset = datakey.data;

	    svg.append('text')
	        .attr('transform', 'rotate(-90)')
	        .attr('x', -100)
	        .attr('y', 80)
	        .text('USD (Billions)');

	    svg.append('a')
	       .attr("href", "http://www.bea.gov/national/pdf/nipaguid.pdf")
	       .attr("target", "_blank")
	       .attr("class", "infolink");

	    var linkx = w/ 2 + 120;

	    svg.append('text')
	       .attr('x', linkx)
	       .attr('y', h + 50)
	       .text('More Information:')
	       .attr('class', 'info');

	    svg.select('a')
	       .append('text')
	       .attr('x', linkx + 105)
	       .attr('y', h + 50)
	       .text('http://www.bea.gov/national/pdf/nipaguid.pdf')
	       .attr('class', 'info');

	    var years = datakey.data.map(function (item) {//makes an array of YYYY Q* strings
		    var quarter;
		    var temp = item[0].substring(5, 7);

		    if (temp === '01') {
		      quarter = 'Q1';
		    } else if (temp === '04') {
		      quarter = 'Q2';
		    } else if (temp === '07') {
		      quarter = 'Q3';
		    } else if (temp === '10') {
		      quarter = 'Q4';
		    }

		    return item[0].substring(0, 4) + ' ' + quarter;
		});

		var yearsDigits = years.map(function (item) {//makes an array of just the years as a string
	    	return item.substring(0, 4);
	    });


	 	var xScale = d3.scaleLinear()
				       .domain([d3.min(yearsDigits), d3.max(yearsDigits)])
				       .range([0, w]);

		var xAxis = d3.axisBottom()
                      .scale(xScale)
                      .tickFormat(d3.format("d"));

        var xAxisGroup = svg.append('g')
				            .attr('id', 'x-axis')
				            .attr('transform', 'translate(60, 400)')
				            .call(xAxis);

		var GDP = datakey.data.map(function (item) {
	    	return item[1];
	    });

	    var scaledGDP = [];

	    var gdpMin = d3.min(GDP);
	    var gdpMax = d3.max(GDP);

	    var linearScale = d3.scaleLinear()
	                        .domain([gdpMin, gdpMax])
	                        .range([(gdpMin / gdpMax) * h, h]);

	    scaledGDP = GDP.map(function (item) {
	    	return linearScale(item);
	    });

	    var yAxisScale = d3.scaleLinear()
                           .domain([gdpMin, gdpMax])
                           .range([h, (gdpMin / gdpMax) * h]);

        var yAxis = d3.axisLeft(yAxisScale);

        var yAxisGroup = svg.append('g')
                            .call(yAxis)
                            .attr('id', 'y-axis')
                            .attr('transform', 'translate(60, 0)');

        var xCoords = function(event) {
        	var bounds = document.querySelector('.svgContainer').getBoundingClientRect();
		    return (event.clientX - bounds.left) + 25;  
		}

        svg.selectAll("rect")
           .data(scaledGDP)
           .enter()
           .append("rect")
           .attr("data-date", (d, i) => datakey.data[i][0])
	  	   .attr("data-gdp", (d, i) => datakey.data[i][1])
	  	   .attr('class', 'bar')
	  	   .attr('x', (d, i) => i * barWidth)
	  	   .attr('y', (d, i) => h - d)
    	   .attr('width', barWidth)
    	   .attr('height', (d) => d)
		   // .style('fill', '#43ba70')
		   .attr("fill", (d) => "rgb(" + Math.round((d / d3.max(scaledGDP)) * 83) + "," + Math.round((d / d3.max(scaledGDP)) * 186) + "," + Math.round((d / d3.max(scaledGDP)) * 83) + ")")
		   .attr('transform', 'translate(60, 0)')
		   .on('mouseover', (d, i) =>{		

	          tooltip.transition()
			         .duration(200)
			         .style('opacity', .9);

			  tooltip.html(years[i] + '<br>' + '$' + GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion')//regex replaces first digit of gdp value with first digit with comma. 
			         .attr('data-date', datakey.data[i][0])
			         .style('left', xCoords(event) + 'px')
			         .style('top', "30%");
			         // .style('transform', 'translateX(60px)');
		   })
		   .on('mouseout', (d) => {
		      tooltip.transition().duration(200).style('opacity', 0);
		   });
		
	 
	});