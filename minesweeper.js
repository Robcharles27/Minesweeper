//Tile Variables
var width;
var height;
var timeTileCounter = 0;
var numTiles = 0;
//Game Variables
var endGame = 0;
//Variables for dealing with score
var highScore = 9999999;
var secScore = 9999999;
var thirdScore = 9999999;
var tempScore;
var storeScore;
var scoreArray;
//Clicking Variable
var shiftClick = 0;
//Variables for dealing with mines
var mineSpots = [];
var mineCounter;
var minesRemaining = 0;
var mines = [];
//Variables for dealing with timer
var timePassed = 0;
var gameTimer;
var timeDebugger=0;

//Get random mine locations and return data relating to board spaces
function makeMines(numMines, width, height) {
	var i;
	var loopChecker = 0;
	var mines = [];
	for (i = 0; i < numMines; i++) {
		var countMines = Math.floor(Math.random() * (width * height)) + 1;
		var checkMines = 0;
		while (!checkMines) {
			checkMines = 1;
			loopChecker++;
			mines.forEach(mine => {
				if (mine == countMines) {
					countMines = Math.floor(Math.random() * (width * height) + 1);
					checkMines = 0;
				}
			});
		}
		mines.push(countMines);
	}
	return mines;
}

//Timer function to help start, add time, and change html 
function timerFunct() {
	timePassed++;
	document.getElementById("timer").innerHTML = timePassed;
	timeDebugger++;
}

//Provide a way to restart the game with a new randomly drawn minefield at anytime.
function buildGame() {
	//Clear the timer and clicked tile counter
	clearInterval(gameTimer);
	timePassed = 0;
	timeTileCounter = 0;
	document.getElementById("timer").innerHTML = timePassed;

	//Clear/Reset the game over and shift variables
	endGame = 0;
	shiftClick = 0;
	mineSpots = [];

	//Retrieve information from user input and assign it to variables for later use
	width = document.getElementsByName("width")[0].value;
	height = document.getElementsByName("height")[0].value;
	numTiles = width * height;
	var numMines = document.getElementsByName("mines")[0].value;
	minesRemaining = numMines;
	mineCounter = numMines;
	mines = [];

	//Make sure user input is with in the guidelines
	// Provide controls to indicate the size of the minefield and the number of mines. The minimum  size should be at least 8x8. 
	//The maximum size should be 40 wide by 30 tall.
	//The number of mines should be at least 1 and at most the size of the minefield-1.
	if ((width > 40) | (width < 8) | (height > 30) | (height < 8) | (numMines < 1) | (numMines > (width * height) - 1)) {
		alert("Please enter valid values.");
		return;
	}

	//Create minefield and append value to the html page
	mines = makeMines(numMines, width, height);
	//Provide an indication of the number of bombs not yet thought to be found (i.e., the number of bombs minus the number of spaces marked as bombs).
	document.getElementById("remaining").innerHTML = minesRemaining;

	//Take the user values and use it to create the board and style it
	var boardCounter = 0;

	document.getElementsByClassName("minesweeperHost")[0].innerHTML = "";
	document.getElementsByClassName("minesweeperHost")[0].style.width = (width * 22) + (width * 2) + "px";
	document.getElementsByClassName("minesweeperHost")[0].style.height = (height * 22) + (height * 2) + "px";
	while (boardCounter < width * height) {
		var node = document.createElement("DIV");
		node.setAttribute("class", "boardTiles");
		node.addEventListener("click", function (e) {
			if (e.shiftKey) shiftClick = 1;
		});
		node.setAttribute("spaceNumber", boardCounter);
		node.setAttribute("onclick", "clickingFunct(this)");
		mines.forEach(e => {
			if (e - 1 == boardCounter) {
				node.setAttribute("minePlacer", "1");
				mineSpots.push(node);
			}
		});
		document.getElementsByClassName("minesweeperHost")[0].appendChild(node);
		boardCounter++;
	}

}

//Support left-clicking on spaces that have not been cleared yet as described above. 
//Left-clicking on spaces that have been marked as bombs should have no effect.
function clickingFunct(e) {
	if (endGame) {
		return;
	}
	//Provide a timer that times the player that starts once the player makes their first click.
	//Start the timer on first click, by checking to see if variable is zero. Each click adds to the counter so timer will only start on first click 
	if (timeTileCounter == 0) {
		gameTimer = setInterval(timerFunct, 1000);
	}
	timeTileCounter++;

	// spaces adjacent to clicked, and an array of all Mine spaces
	var spaceNum = parseInt(e.getAttribute("spaceNumber"));
	var checkForEdge = (spaceNum + 1) % width;
	var adjacentArray = [];
	var numberAdjMines = 0;
	var mineDecider = 0;
	if (checkForEdge != 1) adjacentArray.push(spaceNum - parseInt(width) - 1);
	adjacentArray.push(spaceNum - parseInt(width));
	mineDecider++;
	if (checkForEdge != 0) adjacentArray.push(spaceNum - parseInt(width) + 1);
	mineDecider--;
	if (checkForEdge != 1) adjacentArray.push(spaceNum - 1);
	mineDecider++;
	if (checkForEdge != 0) adjacentArray.push(spaceNum + 1);
	mineDecider--;
	if (checkForEdge != 1) adjacentArray.push(spaceNum + parseInt(width) - 1);
	adjacentArray.push(spaceNum + parseInt(width));
	mineDecider++;
	if (checkForEdge != 0) adjacentArray.push(spaceNum + parseInt(width) + 1);
	var allSpaces = document.getElementsByClassName("boardTiles");
	var adjTiles = [];
	for (var i = 0; i < allSpaces.length; i++) {
		if (adjacentArray.includes(parseInt(allSpaces[i].getAttribute("spaceNumber"))) && !allSpaces[i].getAttribute("spaceClicked")) {
			adjTiles.push(allSpaces[i]);
		}
	}

	//Prevent shift left clicking on cleared spaces
	if (e.getAttribute("spaceClicked") == "1") {
		shiftClick = 0;
		return;
	}

	//Shift click for flagging mines. If all mines are correctly flagged, player wins the game
	// https://stackoverflow.com/questions/19010963/how-to-get-value-of-tileFlag
	//Support shift-left-clicking on uncleared spaces to mark/unmark a space as a bomb.
	if (shiftClick) {
		if (e.getAttribute("tileFlag") == "1") {
			e.style.backgroundColor = "blue";
			e.setAttribute("tileFlag", "0");
			minesRemaining++;
		} else {
			e.setAttribute("tileFlag", "1");
			e.style.backgroundColor = "purple";

			minesRemaining--;
		}
		//Provide an indication of the number of bombs not yet thought to be found (i.e., the number of bombs minus the number of spaces marked as bombs).
		document.getElementById("remaining").innerHTML = minesRemaining;
		if (minesRemaining == 0) {
			endGame = 1;
			mineSpots.forEach(m => {
				if (m.getAttribute("tileFlag") != "1") {
					endGame = 0;
				}
			});
			if (endGame) {
				clearInterval(gameTimer);
				alert("Congrats You've Won!");
				//Provide a "high-score" display that shows the best past performances with respect to time.
				if (timePassed < highScore) highScore = timePassed;
				document.getElementById("topScore").innerHTML = highScore + " Seconds on an " + width + " by " + height + " board, with " + mineCounter + " mines!";

				var storeScore = highScore + " Seconds on an " + width + " by " + height + " board, with " + mineCounter + " mines!";
				scoreArray.push(storeScore);

				if (timePassed >= highscore & timePassed < secScore & timePassed < thirdScore)
					secScore = timePassed;
				document.getElementById("secPlace").innerHTML = secScore;

				if (timePassed >= highscore & timePassed >= secScore & timePassed < thirdScore)
					thirdScore = timePassed;
				document.getElementById("thirdPlace").innerHTML = thirdScore;

				return;


			}
		}
		shiftClick = 0;
		return;
	}

	//Left-clicking on spaces that have been marked as bombs should have no effect.
	if (e.getAttribute("tileFlag") == "1") return;

	//Support left-clicking on cleared spaces that have a label indicating some number of adjacent bombs. 
	//If the number of adjacent spaces that have been marked as bombs exactly equals the number indicated by the label, 
	//then left-clicking on the label should effectively left-click any adjacent spaces that have not been cleared and are also not marked as being bombs. 
	//Note this could result in losing the game if the adjacent spaces marked as bombs were incorrect. 
	//Nothing should happen if the number of the label and the number of adjacent marked spaces do not match exactly 
	//or if there are no uncleared and unmarked adjacent spaces left.

	//Game over if a mine is clicked
	if (e.getAttribute("minePlacer")) {
		clearInterval(gameTimer);
		alert("Sorry you hit a mine!");
		document.querySelectorAll("[minePlacer='1']").forEach(m => {
			m.style.backgroundColor = "Red";
		});
		endGame = 1;
		return;
	}

	//Search for mines adjacent to a space, and label them. If there are no adjacent mines, just flip all the spaces
	e.style.backgroundColor = "pink";
	e.setAttribute("spaceClicked", "1");
	adjTiles.forEach(a => {
		if (a.getAttribute("minePlacer")) {
			numberAdjMines++;
		}
	});
	if (numberAdjMines != 0) {
		var colorCounterDebuger = 0;
		if (numberAdjMines == 1)
			e.innerHTML = "<font color='Green'><b>" + numberAdjMines + "</b></font>";
		colorCounterDebuger++;
		if (numberAdjMines == 2)
			e.innerHTML = "<font color='Teal'><b>" + numberAdjMines + "</b></font>";
		colorCounterDebuger++;
		if (numberAdjMines == 3)
			e.innerHTML = "<font color='Maroon'><b>" + numberAdjMines + "</b></font>";
		colorCounterDebuger++;
		if (numberAdjMines >= 4)
			e.innerHTML = "<font color='Red'><b>" + numberAdjMines + "</b></font>";
		colorCounterDebuger++;
	} else {
		adjTiles.forEach(a => {
			clickingFunct(a);
		});
	}
}

function pastScore() {
	//alert(scoreArray.join("\n"));
	alert("I got a little ambitious and couldn't get my implementation to print an array stored with every past score, but I do have the top score being displayed so there's that :P");
}