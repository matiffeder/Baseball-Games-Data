"use strict"

/* define the margin and also make it easier to set positon */
let margin = {
    top: 180,
    right: 200,
    bottom: 50,
    left: 40
};

/* the width and height for chart without lable */
let chartWidth = 1200 - (margin.left + margin.right);
let chartHeight = 900 - (margin.top + margin.bottom);

/* add svg tag to the div which ID is canvas and set by definesd width and height and define its name for later use*/
let satisfactionMap = d3.select("#canvas")
    .append("svg")
    .attr("width", 1200) //the width for draw
    .attr("height", 900) //the height for draw
    .append("g") // this appended group will be what is drawn to
    .attr("transform",
        `translate(${margin.left},${margin.top})`); //change the offest

/* get data from data.json and use the drawScatter func */
d3.json("data.json").then(drawMap);

/* learn from data_example_3.zip */ 
let flatData = []; //claim the array for data that have flatten
/** function flatingData(object, value)

make my data to be flat and only use some data I need

 * @param {object} object - a object in object for flat, in the func is value.brothersStat and value.opponentStat
 * @param {object} object - a object for flat, in the func is from my json
**/
function flatingData(object, value) {
    /* search in the object by key and value in array*/
    Object.entries(object).forEach(function([key, sValue]) {
        if (key!="Hits" && key!="At Bat" && key!="Scores" && (object!=value.opponentStat && (key=="Errors" || key=="Unearned Run"))) {
            let flatItems = {}; //define the object for brothersStat or opponentStat
            flatItems.date = value.date; //get the original date value
            flatItems.satisfaction = value.satisfaction; //get the original satisfaction value
            if (object==value.opponentStat) {
                flatItems.type = `Opponent's ${key}`; //get the key from value.brothersStat or value.opponentStat and make it be a value for flatItems.type
            } else {
                flatItems.type = `Brothers' ${key}`;
            }
            flatItems.stat = sValue; //get the sValue from value.brothersStat or value.opponentStat and make it be a value for flatItems.stat
            flatData.push(flatItems); //add the above object to flatData
        }
    })
}

/** function drawMap(dataset)

draw satisfaction map from my json data

 * @param {object} dataset - a json data for draw visualization
**/
function drawMap(dataset) {

    /* search in my json to add flat data */
    dataset.forEach(function(v) {
        let flatItems = {}; //define the object for Scores Difference
        flatItems.date = v.date; //get the original date value
        flatItems.satisfaction = v.satisfaction; //get the original satisfaction value
        flatItems.type = "Scores Difference (B-O)"; //define the type name
        flatItems.stat =  v.brothersStat.Scores - v.opponentStat.Scores; //calc the Scores Difference
        flatData.push(flatItems); //add the above object to flatData
        flatingData(v.brothersStat, v); //add the brothersStat value to flatData
        flatingData(v.opponentStat, v); //add the opponentStat value to flatData
    })
    // console.log(flatData);
    
    /* sort data and make small stat shows on left */
    flatData.sort(function(a, b) {return a.stat - b.stat});

    /* define the band scale for X */
    let xScale = d3.scaleBand()
        /* get the value array for domain */
        .domain(Array.from(new Set(flatData.map(function (value) {
            return value.stat;
        }))))
        .range([0, chartWidth]) //the px range on page
        .padding(0.05); //set the space between cells

    /* add g tag in satisfactionMap to give sapce for x axis and show it */
    satisfactionMap.append("g")
        .style("font-size", 20) //set font size
        .attr("transform", `translate(0, ${chartHeight})`) //change the offset
        .call(d3.axisBottom(xScale).tickSize(0)) // hide scale ticks
        .select(".domain").remove(); // remove the domain line that on bottom

    /* define the band scale for y */
    let yScale = d3.scaleBand()
        .domain(Array.from(new Set(flatData.map(function (value) {
            return value.type;
        }))))
        .range([chartHeight, 0])
        .padding(0.05);

    /* add g tag in satisfactionMap to give sapce for y axis and show it */
    satisfactionMap.append("g")
        .style("font-size", 15)
        .attr("transform", `translate(${chartWidth},0)`)
        .call(d3.axisRight(yScale).tickSize(0)) // hide ticks
        .select(".domain").remove() // remove the domain line

    /* define color scale for cells */
    let colorScale = d3.scaleSequential() //a Sequential color
        .interpolator(d3.interpolateRgb("#FFDD50", "#FF8850")) //interpolate color from #FFDD50 to #FF8850
        /* set the value array for domain */
        .domain([0, 2
                /* I think use 0 and 2 is better than following codes
                d3.min(flatData, function (value) { // gets us min and max value
                return value.brothersStat.Hits/value.brothersStat["At Bat"];
            }), d3.max(flatData, function (value) { // gets us min and max value
                return value.brothersStat.Hits/value.brothersStat["At Bat"];
            }) */
        ]);
    
    /* claim count for the cells that in the same coordinate */
    let count = {
        "Scores Difference (B-O)": {}
    };
    /* claim the index for the cells that in the same coordinate for set y offset*/
    let yID = {
        "Scores Difference (B-O)": 0
    };
    /* add value in above object by the key in original data 
    we only need brothersStat because the keys in opponentStat are the same */
    Object.entries(dataset[1].brothersStat).forEach(function([key]) {
        count[`Brothers' ${key}`] = {};
        count[`Opponent's ${key}`] = {};
        yID[`Brothers' ${key}`] = 0;
        yID[`Opponent's ${key}`] = 0;
    })
    flatData.forEach(function(v) { //search in flatData
        /* since the object is empty, we need 0 rather than NaN for the first count */
        count[v.type][v.stat] = (count[v.type][v.stat]||0) + 1; //calc how many data have the same stat
    })

    /* this is use for a different json file that is flatten
    dataset.forEach(value => {
        count[value.type][value.stat] = (count[value.type][value.stat]||0) + 1;
    }) */
    
    /* draw cells */
    satisfactionMap.selectAll()
        .data(flatData) //use flatData
        .join("rect") //add rect tag
        /* set the x of cells by the defined xScale */ 
        .attr("x", function(v) {return xScale(v.stat)}) //the number of stat
        /* arrange cells by yID since many data in the same coordinate */
        .attr("y", function(v) { //the type of data
            /* the record of yID should smaller than the count we calc above
            if the yID more or equal to the count that means the stat has changed 
            because the data is sort by stat 
            I think we can also use v.stat here to record
            such as if the current v.stat is different to previous*/
            if (yID[v.type]>=count[v.type][v.stat]) { 
                yID[v.type] = 0;
            };
            /* because we don't know which data are running, we need use yID to record the order */
            yID[v.type] += 1; //record the order by yID
            /* the order should star from 0 since the y of first cell is yScale(v.type), so we need -1 here
            each cell would have the width yScale.bandwidth()/count[v.type][v.stat] 
            so use (yID * cell width) could get the y of current data */
            return yScale(v.type) + (yID[v.type]-1)*(yScale.bandwidth()/count[v.type][v.stat]);
        })
        .attr("rx", 4) //set the coner round in x
        .attr("ry", 4) //set the coner round in y
        .attr("width", xScale.bandwidth()) //the width of cell
        .attr("height", function (v) {
            /* the height of cells should divide by the count of the cells that in the same coordinate */
            return yScale.bandwidth()/count[v.type][v.stat];
        })
        .style("fill", function (v) {
            return colorScale(v.satisfaction); //use satisfaction level to fill color
        })
        //style("stroke-width", 4)
        //.style("stroke", "none")
        
    /* draw date labels for cells, select all texts that the class is label */
    satisfactionMap.selectAll("text.label")
        .data(flatData) //use the flatData
        .join("text") //add text tags
        .attr("class", "label") //give it label class
        .attr("font-family", "sans-serif") //use sans-serif font
        .attr("font-size", "10px") //set font size
        .attr("font-weight", 900) //very bold texts
        //shows date as labels
        //.text(v => d3.format(".3f")(v.brothersStat.Hits/v.brothersStat["At Bat"]))
        .text(function(v) {return v.date}) //defint what the lable will show
        /* make the x and y offset are in the middle of the cell
        the x of cell middle is "xScale(v.stat) + xScale.bandwidth()/2"
        the middle of text is "this.getComputedTextLength/2"
        so use "cell middle x" - "middle of text" could put lable on the center of cell */
        .attr("x", function (v) {return xScale(v.stat) + xScale.bandwidth()/2 - this.getComputedTextLength()/2})
        .attr("y", function (v) {
            if (yID[v.type]>=count[v.type][v.stat]) {
                yID[v.type] = 0;
            };
            yID[v.type] += 1;
            return yScale(v.type) + (yID[v.type]-1)*(yScale.bandwidth()/count[v.type][v.stat])+(yScale.bandwidth()/count[v.type][v.stat])/2+4;
        })
        .style("opacity", .3) //set original opacity to transition
        .transition() //set opacity to transition
        .duration(2000) //2sec to transition
        .style("opacity", 1) //set end opacity of transition

    /* start of draw 3 color circles and texts that for users to understand the meaning */
    for (let i=0; i<3; i++) {
        let color = "#FF8850"; //colorScale(2) //color of circle. if not 1 and 2. set default value as orange
        let text = "Satisfied (2)"; //label of circle. if not 1 and 2. set default value as Satisfied (2)
        if (i==1) {
            color = "#FFB350"; //got the color from console.log(colorScale(1));
            text = "Medium (1)";
        } else if (i==2) {
            color = "#FFDD50"; //colorScale(0)
            text = "Not Satisfied the game (0)";
        }
        satisfactionMap.append("circle") //draw the circles for indicating
            .attr("r", 15) //the radius of circles
            .attr("fill", color) //fill color by defined value
            .attr("cx", 20+i*150) //the x are 20 170 320
            .attr("cy", -60) //the y offset of circles

        satisfactionMap.append("text") //texts to explain the colors of circles
            .text(text) //write text by defined value
            .attr("x", 40+i*150) //the x are 40 190 340
            .attr("y", -55)
            .attr("font-family", "sans-serif") //use sans-serif font
            .attr("font-size", "13px"); //set font size
    } //end of draw these circles

    /* the title of the plot */
    satisfactionMap.append("text")
        .attr("x", 0)
        .attr("y", -150)
        .attr("text-anchor", "left") //use left to anchor
        .style("font-size", "22px")
        .text("The Satisfaction Map Shows Relationship with Different Factors");

    /* the description of the plot */
    satisfactionMap.append("text")
        .attr("class", "subtitle")
        .attr("x", 0)
        .attr("y", -140)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .text("The colored cells shows my satisfaction level. The number of X-Axis shows the number of Brothers' Errors, Brothers' Unearned Run, and Scores Difference (Brothers-Opponent). If there are more than one rectangle in a coordinate that means there are more than one data have the same value.")
        .call(wrap, chartWidth-300); //use the wrap function in the js file
}

/* wrote by example in class, I didn't edit it including comments */
function wrap(text, chartWidth) {
    text.each(function () {
        let text = d3.select(this);
        let words = text.text().split(/\s+/).reverse(); // split on spaces
        let word;
        let line = [];
        let lineNumber = 0;
        let linechartHeight = 1.1; // ems
        let x = text.attr("x"); // get the "x" attribute of our text that we're adding tspans to
        let y = text.attr("y"); // get the "y" attribute of our text that we're adding tspans to
        let dy = 1.1; // extra spacing
        let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) { // note assignment here, not comparison! will get "false" when no words left
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > chartWidth) { // if we exceeded line chartWidth...
                line.pop(); // pop that last added item off
                tspan.text(line.join(" "));
                line = [word]; // start the next line with the word we are currently processing
                // note prefix ++ which means "add 1 to lineNumber before using it"!
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * linechartHeight + dy + "em").text(word); // generate the tspan element for the line
            } // end condition of line chartWidth exceeded (and thus draw line)
        } // end loop to process words
    });
}