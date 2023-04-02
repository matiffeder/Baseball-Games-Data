"use strict"

/* define the canves space */
let width = 1200; // svg width
let height = 800; // svg height

/* define the margin and also make it easier to set positon */
let margin = {
    left: 100,
    right: 100,
    top: 200,
    bottom: 100
};

/* add svg tag to the div which ID is canvas and set by definesd width and height */
let svg = d3.select("#canvas")
    .append("svg")
    .attr("width", width)  //the width for draw
    .attr("height", height); //the height for draw

let dataset;//claim the dataset name

/* get data from data.json and use the drawScatter func */
(async function () {
    dataset = await d3.json("data.json").then(drawScatter);
})();

/** function drawScatter(dataset)

draw scatterplot from my json data

 * @param {object} dataset - a json data for draw visualization
**/
function drawScatter(dataset) {
    /* sort data and make small data shows on top
    "Hits" here use first character upper case since I would use Object.entries to show keys and values on page */
    dataset.sort(function(a, b) {return b.brothersStat.Hits - a.brothersStat.Hits}) //shows smaller circle at top

    /* define the x linear scales
    domain: from min number of data to max,
    range: the px range on page */
    let xScale = d3.scaleLinear() //the scale of Batting Average (x)
        /* d3.min(a, b) > the min number of b in a
        d3.max(a, b) > the max number of b in a
        -0.01 is to make the bubble do not shows on the line  */
        .domain([d3.min(dataset, function(v) {return v.brothersStat.Hits / v.brothersStat["At Bat"]-0.01}), d3.max(dataset, function(v) {return v.brothersStat.Hits / v.brothersStat["At Bat"]})]) //detail of => https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Functions/Arrow_functions
        .range([margin.left, width - margin.right]);

    /* define the y linear scales */
    let yScale = d3.scaleLinear() //the scale of scores (y), 
        /* -1 is to make the bubble do not shows on the line */ 
        .domain([d3.min(dataset, function(v) {return v.brothersStat.Scores})-1, d3.max(dataset, function(v) {return v.brothersStat.Scores})])
        .range([height - margin.bottom, margin.top]);

    /* define the radius of circles, I use scaleLinear instead of d3.scaleSqrt here for make bigger numbers more different */
    let rScale = d3.scaleLinear() //the scale of Hits (r), .range is radius of the circle 
        .domain([d3.min(dataset, function(v) {return v.brothersStat.Hits}), d3.max(dataset, function(v) {return v.brothersStat.Hits})])
        .range([5, 55])

    /* draw circles */
    let circles = svg.selectAll("circle")//select circle tags
        .data(dataset) //use the dateset that give in the function
        .join("circle") //add circle tags
        /* set the x of circles by the following defined xScale */ 
        .attr("cx", function(v) {
            /* "Hits" here use first character upper case since I use Object.entries to show keys and values on page */
            return xScale(v.brothersStat.Hits / v.brothersStat["At Bat"]) //Batting Average of Brothers (Hits/At Bat)
        })
        /* set the y of circles by the following defined yScale */ 
        .attr("cy",  function(v) {
            return yScale(v.brothersStat.Scores) //The scores Brothers Got in a game
        })
        /* set the radius of circles by the following defined rScale  */
        .attr("r", function(v) {
            return rScale(v.brothersStat.Hits) //Hits of Brothers
        })
        //.attr("stroke", "white") //shows storke of circle for easier to read
        .style("opacity", .5) //use opacity for shows circles clearer if they covered each other
        .attr("fill", function(v) { //set colors for satisfaction level, from 0 to 2
            if (v.satisfaction==2) { //Satisfied
                return "Orange";
            } else if (v.satisfaction==1) { //Medium
                return "Gold";
            } else { //Not Satisfied
                return "Silver";
            }
        })
        /* register the event when mouseover element to show circle values clearly and use data as v
        learn from http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774 */
        .on("mouseover", function (v) {
            d3.select(this) //select this circle
                .style("opacity", 1) //change opacity

            /* draw date labels for circles, select all texts that the class is label */    
            svg.append("text") //add text tags
                .attr("class", "hoverLable") //give it hoverLable class
                .attr("font-family", "sans-serif") //use sans-serif font
                .attr("font-size", "11px") //set font size
                .attr("font-weight", 600) //bold texts 
                .attr("fill", function() { //fill color by game result //we don't use v in the function since v is in mouseover function
                    if (v.brothersStat.Scores-v.opponentStat.Scores > 0) {//if Brothers win
                        return "#DD5F8B"; //red
                    } else if (v.brothersStat.Scores-v.opponentStat.Scores < 0) {//if Brothers lose
                        return "#119CBF"; //blue
                    }//if tie use default color
                })
                .text(function() {return v.date}) //defint what the lable will show
                /* make the x offset are in the middle of the circle
                the x of circle middle is "v.brothersStat.Hits / v.brothersStat["At Bat"]"
                the middle of text is "this.getComputedTextLength/2"
                so use "circle middle x" - "middle of text" could put lable on the center of circle
                or we can use .attr("text-anchor", "middle") to set x on the center*/
                .attr("x", function () {return xScale(v.brothersStat.Hits / v.brothersStat["At Bat"]) - this.getComputedTextLength()/2})
                /* I want put the label under the circle, so the y should plus the radius of the circle */
                .attr("y", function () {return yScale(v.brothersStat.Scores)+rScale(v.brothersStat.Hits)+10}) 

            /* draw error labels for circles, select all texts that the class is label2*/
            svg.append("text") //add text tags
                .attr("class", "hoverLable2") //give it hoverLable class
                .attr("font-family", "Arial", "sans-serif") //first use Arial font to make the circle shows the same on differet pc
                .attr("font-size", "12px")
                .attr("font-weight", 800)
                /* shows error & unearned run as labels */
                .text(function() {
                    let text=""; //if no error and unearned run, show nothing
                    /* add a "。" in text by error count */
                    for (let i=0; i<v.brothersStat.Errors; i++) {
                        text=text+"○";
                    }
                    //if (v.brothersStat["Unearned Run"]>0) {
                        //text=text+"/";
                        /* add a "‧" in text by unearned run count */
                        for (let i=0; i<v.brothersStat["Unearned Run"]; i++) {
                            text=text+"●";
                        }
                        return text; //return text to label text
                    //}
                })
                /* make the x offset are under the date lable
                or we can use .attr("text-anchor", "middle") to set x on the center */
                .attr("x", function () {return xScale(v.brothersStat.Hits / v.brothersStat["At Bat"]) - this.getComputedTextLength()/2})
                .attr("y", function () {return yScale(v.brothersStat.Scores)+rScale(v.brothersStat.Hits)+20})

            d3.selectAll(".label") //selece elements that class is label
                .style("visibility", "hidden") //hide it when mouse over
            d3.selectAll(".label2")
                .style("visibility", "hidden")

        })
        /* register the event when mouseout element to show circle values clearly and use data as v*/
        .on("mouseout", function () {
            d3.select(this)
                .style("opacity", .5)
            d3.selectAll(".hoverLable").remove(); //remove the class that added after mouse over
            d3.selectAll(".hoverLable2").remove();
            d3.selectAll(".label")
                .style("visibility", "visible") //show the element we hide again when mouse leave
            d3.selectAll(".label2")
                .style("visibility", "visible")
        })

    /* draw date labels for circles, select all texts that the class is label */
    let labels = svg.selectAll("text.label")
        .data(dataset) //use the dateset that give in function
        .join("text") //add text tags
        .attr("class", "label") //give it label class
        .attr("font-family", "sans-serif") //use sans-serif font
        .attr("font-size", "11px")
        .attr("font-weight", 600) //bold texts 
        .attr("fill", function(v) { //fill color by game result 
            if (v.brothersStat.Scores-v.opponentStat.Scores > 0) {//if Brothers win
                return "#DD5F8B"; //red
            } else if (v.brothersStat.Scores-v.opponentStat.Scores < 0) {//if Brothers lose
                return "#119CBF"; //blue
            }//if tie use default color
        })
        .text(function(v) {return v.date}) //defint what the lable will show
        /* make the x and y offset are in the middle of the circle
        the x of circle middle is "v.brothersStat.Hits / v.brothersStat["At Bat"]"
        the middle of text is "this.getComputedTextLength/2"
        so use "circle middle x" - "middle of text" could put lable on the center of circle
        or we can use .attr("text-anchor", "middle") to set x on the center
                            //=> is not work here since "this" can not be used */
        .attr("x", function (v) {return xScale(v.brothersStat.Hits / v.brothersStat["At Bat"]) - this.getComputedTextLength()/2})
        .attr("y", function (v) {return yScale(v.brothersStat.Scores)+5}) //5 is the half of the text height
        

    /* draw error labels for circles, select all texts that the class is label2*/
    let labels2 = svg.selectAll("text.label2")
        .data(dataset) //use the dateset that give in function
        .join("text") //add text tags
        .attr("class", "label2") //give it label2 class
        .attr("font-family", "Arial", "sans-serif") //first use Arial font to make the circle shows the same on differet pc
        .attr("font-size", "10px")
        .attr("font-weight", 800)
        /* shows error & unearned run as labels*/
        .text(function(v) {
            let text=""; //if no error and unearned run, show nothing
            /* add a "。" in text by error count*/
            for (let i=0; i<v.brothersStat.Errors; i++) {
                text=text+"○";
            }
            //if (v.brothersStat["Unearned Run"]>0) {
                //text=text+"/";
                /* add a "‧" in text by unearned run count*/
                for (let i=0; i<v.brothersStat["Unearned Run"]; i++) {
                    text=text+"●";
                }
                return text; //return text to label text
            //}
        })
        /* make the x and y offset are under the date lable
        or we can use .attr("text-anchor", "middle") to set x on the center*/
        .attr("x", function (v) {return xScale(v.brothersStat.Hits / v.brothersStat["At Bat"]) - this.getComputedTextLength()/2})
        .attr("y", function (v) {return yScale(v.brothersStat.Scores)+18})

    /* add g tag in svg to give sapce for xAxis and show it */
    let xAxis = svg.append("g")
        .attr("class", "axis") //give it axis class
        .attr("transform", `translate(0, ${height-margin.bottom})`) //direct by use translate the position to put the axis
        /* call d3 function to make an axis and use the definded xScale for x axis
        shows 3 numbers after decimal point https://github.com/d3/d3-axis, baseball game shows 3 numbers in AVG
        the 1st arg in ticks() is the min count of ticks, it's multiples of five */ 
        .call(d3.axisBottom().scale(xScale).ticks(15, ",.3f"));

    /* add g tag in svg to give sapce for yAxis and show it */
    let yAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));
    
    /* add text tag in svg for xAxisLabel */
    let xAxisLabel = svg.append("text")
        .attr("class", "axisLabel") //use css axisLabel class
        /* if margin left and right are different
         |-margin.left-|-----xAxis-----|-margin.right-|
         |-------------------width--------------------|
        center of the axis should be:
        .attr("x", (width-margin.left-margin.right)/2+margin.left)
        if margin left and right are the same, then width / 2 is center */
        .attr("x", width / 2) //set x offset
        .attr("y", height - margin.bottom / 2) //set y offset
        .attr("text-anchor", "middle") //anchor by middle for make label shows on center
        .text("Batting Average of Brothers (Hits/At Bat)"); //the text of label

    /* add text tag in svg for yAxisLabel */
    let yAxisLabel = svg.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        /* margin top and bottom are different
         |-margin.top-|-----yAxis-----|-margin.bottom-|
         |-------------------width--------------------|
        so center of the axis should be: */
        .attr("x", -(height-margin.top-margin.bottom)/2-margin.top)
        .attr("y", margin.left - margin.left /4)
        .attr("text-anchor", "middle")
        .text("Scores of Brothers");

    /* the title of the plot */
    svg.append("text")
        .attr("x", 80)
        .attr("y", 30)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("The Relationship with My Satisfaction and Brothers' Data (Interactable)");

    /* start of draw 3 color circles and texts that for users to understand the meaning */
    for (let i=0; i<3; i++) {
        let color = "Orange"; //color of circle. if not 1 and 2. set default value as orange
        let text = "Satisfied (2)"; //label of circle. if not 1 and 2. set default value as Satisfied (2)
        if (i==1) {
            color = "Gold";
            text = "Medium (1)";
        } else if (i==2) {
            color = "Silver";
            text = "Not Satisfied the game (0)";
        }
        svg.append("circle") //draw the circles for indicating
            .attr("r", 15) //the radius of circles
            .attr("fill", color) //fill color by defined value
            .attr("cx", 120+i*150) //the x are 120 270 420
            .attr("cy", 65) //the y offset of circles

        svg.append("text") //texts to explain the colors of circles
            .text(text) //write text by defined value
            .attr("x", 140+i*150) //the x are 140 290 440
            .attr("y", 70)
            .attr("font-family", "sans-serif") //use sans-serif font
            .attr("font-size", "13px"); //set font size
    } //end of draw these circles

    /* write texts to explain the meaning of radius */
    svg.append("text")
        .attr("x", 110) //set x offset
        .attr("y", 105) //set y offset
        .attr("font-family", "sans-serif")
        .attr("font-size", "13px")
        .attr("font-weight", 600) //use bold for following texts https://richardbrath.wordpress.com/2018/11/24/using-font-attributes-with-d3-js/
        .text("Radius: ") //write the description
        .append("tspan")  //separate two texts then make them different https://richardbrath.wordpress.com/2018/11/24/using-font-attributes-with-d3-js/
        .attr("font-weight", 400) //normal texts https://richardbrath.wordpress.com/2018/11/24/using-font-attributes-with-d3-js/
        .text("Hits of Brothers");

    /* write texts to explain the meaning of date color */
    svg.append("text")
        .attr("x", 110)
        .attr("y", 125)
        .attr("font-family", "sans-serif")
        .attr("font-size", "13px")
        .attr("font-weight", 600) //use bold for following texts
        .text("Date Color: ")
        .append("tspan")  //separate two texts so we can make it different
        .attr("font-weight", 400) //normal texts
        .attr("fill", "#DD5F8B") //set the text color for following text (red)
        .text("Win | ")
        .append("tspan")  //separate two texts
        .attr("fill", "#119CBF") //set the text color for following text (blue)
        .text("Lose | ")
        .append("tspan")  //separate two texts
        .attr("fill", "#000") //set the text color for following text
        .text("Tie");

    /* write texts to explain the dots on circle */
    svg.append("text")
        .attr("x", 110)
        .attr("y", 145)
        .attr("font-family", "sans-serif")
        .attr("font-size", "13px")
        .attr("font-weight", 600) //bold texts 
        .text("[○]: ")
        .append("tspan")  //separate two texts
        .attr("font-weight", 400) //normal texts
        .text("1 error from Brothers / ")
        .append("tspan")  //separate two texts
        .attr("font-weight", 600) //bold texts 
        .text("[●]: ")
        .append("tspan")  //separate two texts
        .attr("font-weight", 400) //normal texts
        .text("1 unearned run gave to opponent")

    /* the description of the plot */
    svg.append("text")
        .attr("class", "subtitle")
        .attr("x", 650)
        .attr("y", 55)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .text("Since the bubbles are covering each other, I made the the scatterplot to be interactive. This scatterplot shows the relationship between the different variables of Brothers and my satisfaction.")
        .call(wrap, 450); //use the wrap function in the js file
    
    return dataset; // global it and we can use later
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

/* abnormal data
 }, {
    "date": "10/19",
    "brothersStat": {
        "Scores": 6,
        "Hits": 2,
        "At Bat": 29,
        "Errors": 0,
        "Unearned Run": 0
    },
    "opponentStat": {
        "Scores": 5,
        "Hits": 9,
        "At Bat": 35,
        "Errors": 3,
        "Unearned Run": 2
    },
    "satisfaction": 0
    */











