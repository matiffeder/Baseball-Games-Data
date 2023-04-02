"use strict"

d3.json("data.json").then(foramatData); // get data and use foramatData

/** function foramatData (data)

write foramatted data from my json by output3.js. the output.js is from a example file of class 

 * @require output3.js
 * @param {object} data - my json data for foramating
**/
function foramatData (data) {
    /* get each value from brothersGamesData and labeled it as "game" for later use  */
    for (let game of data){ //search in brothersGamesData
        output("Game on <b>"+game.date+"/2021</b><br>", true);
        let brothers = game.brothersStat; //use shorter name for later use
        let opponent = game.opponentStat;

        /** function statList(traget)

        a function to get different statistics value of teams in a game 
        and build a list by output()

        Requirements: output(), brothersGamesData

        Parameters:
        * @param {object} traget - object, should be brothersGamesData.brothersStat or brothersGamesData.opponentStat

        **/
        function statList(traget) {
            /* the string to shows title of the statistics, opponent is default value */
            let team="opponent"; //if traget!=brothers
            if (traget==brothers) {
                team="Brothers";
            }
            /* build a list and change the line hight */
            output("<ul style='margin-bottom:0'><li>Statistics of <b>"+team+"</b></li></ul>", true);
            /* get properties's name and value https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries */
            Object.entries(traget).forEach(
                /* [name, value] is the first parameter of the function and it's an array */
                function([name, value]){
                    /* shows statistics. indents the line and shows different list point */
                    output("<li style='padding-left:50; list-style-type:circle'>"+name+": <b>"+value+"</b></li>", true);
                }
            ); //end forEach loop in target
        }
        statList(brothers); //shows statistics of Brothers
        /* toFixed(3) is number formate, means shows 3 decimals  */
        output(`<li style='padding-left:50; list-style-type:circle'>Batting Average: <b>${(brothers.Hits / brothers["At Bat"]).toFixed(3)}</b></li>`, true);
        statList(opponent); //shows statistics of Brothers's opponent
        output(`<li style='padding-left:50; list-style-type:circle'>Batting Average: <b>${(opponent.Hits / opponent["At Bat"]).toFixed(3)}</b></li>`, true);

        let result = "none"; //the value for showing result of the game, "none" is default value
        if (brothers.Scores-opponent.Scores>0) { //calc by score
            result = "Win";
        } else if (brothers.Scores-opponent.Scores<0) {
            result = "Lose";
        } else { //brothers.Scores-opponent.Scores=0
            result = "Tie";
        }
        
        /* shows game result */
        output("<br>Result for Brothers: <b>"+result+"</b><br>", true);
        /* shows my satisfaction level */
        output("My satisfaction level of the game (0~2): <b>"+game.satisfaction+"</b><br><br>", true);
        endOutput();
    } //end for (game of brothersGamesData) loop
}
