document.numberOfPlayers = 1;
document.submittedWords = [];
document.currRotation = 0;

const MessageType = Object.freeze({"initialBoards":"initialBoards","endGame":"endGame"});
const Pages = Object.freeze({"mainMenu":"mainMenu", "inGame":"inGame","setupSingle":"setupSingle","setupMulti":"setupMulti"});
document.pages = {};
document.pages[Pages.mainMenu] = ["mainMenu"];
document.pages[Pages.setupSingle] = ["setupSinglePlayer","leftMenu_setup"];
document.pages[Pages.setupMulti] = ["setupMulti","leftMenu_setup"];
document.pages[Pages.inGame] = ["game","leftMenu_ingame"];

// load data
$.ajax({
	url: "data/tiles.txt",
	dataType: "JSON",
	success: function(data) {
		document.tiles = data;
	}
});

document.wordlist = [];
[10, 20, 35, 40, 50, 55, 60, 70].forEach(function (frequency) {
	var url = "data/words/english-words-"+frequency+".json";
	$.ajax({
		url: url,
		dataType: "JSON",
		success: function(data) {
			document.wordlist = document.wordlist.concat(data);
		}
	});

});

function endGame(){
	if(document.isSinglePlayerGame){
		document.me = randomAlphanumeric();
		document.uniqueWords = copyArr(document.words);
		var msg = {
			"words":document.words,
			"sender":document.me
		};
		document.getElementById("wordInputDiv").style.display = "none";
		sendMessage(msg,MessageType.endGame);
	}
	else{
		alert("Your score is "+document.score);
	}
}

function receivedWords(){

}

function mainMenu(){
	// Stop timer & set to zeros
	togglePause(0);
	clearInterval(document.timeinterval);
	document.remaining = null;

	// Remove words
	var id = "wordList";
	var node = document.getElementById(id);
	var cNode = node.cloneNode(false);
	node.parentNode.replaceChild(cNode, node);

	// Remove Tiles
	removeBoardTiles();

	// Go to main menu
	toggleVisiblePage(Pages.mainMenu);
}

function toggleHost(isHost){
	if(isHost){
		var seed = startChannel();
		document.board = shuffledBoard();
		document.multiplayerSeed = seed;
		document.getElementById("game_id").innerText = seed;
		document.getElementById("host").style.display = "";
		document.getElementById("join").style.display = "none";
		document.getElementById("startGameMultiButton").style.display = "";
		
	}
	else {
		document.board = null;
		document.getElementById("host").style.display = "none";
		document.getElementById("join").style.display = "";
		document.getElementById("startGameMultiButton").style.display = "none";

	}
}

function joinMultiplayer(event,obj){
	if (event.key === "Enter") {
		var val = obj.value;
		if(val != ""){
			joinChannel(val);
		}
	}
}

function multiplayer(){
	document.setupTime = 5;
	toggleVisiblePage(Pages.setupMulti);
	// sendMessage();	
}

function setupSingle(){
	document.board = shuffledBoard();
	document.setupTime = 5;
	toggleVisiblePage(Pages.setupSingle);
}

function changeTimeMulti(change){
	var time = document.setupTime
	time += change;
	if(time > 5) time = Math.min(10,time);
	else time = 5;

	setClock_setup_multi(time,0);

	document.setupTime = time;
}


function changeTime(change){
	var time = document.setupTime;
	time += change;
	if(time > 5) time = Math.min(10,time);
	else time = 5;

	setClock(time,0);

	document.setupTime = time;
}

function startSingleGame(){
	document.isSinglePlayerGame = true;
	startGame();
} 	

function startMultiGame(){
	document.isSinglePlayerGame = false;
	var msg = {
		"board" : document.board,
		"time" : document.setupTime
	}
	sendMessage(msg,MessageType.initialBoards);
}

function startGame(){
	document.score = 0;
	document.words = []
	var arr = document.board;
	for(var i = 0; i < 5; i++){
		for(var j = 0; j < 5; j++){
			var divContainer = document.createElement("div");
			divContainer.id = "row_"+i+"_column_"+j+"_0";
			divContainer.className = "grid-item";
			divContainer.innerText = arr[i][j];

			var divContainer1 = document.createElement("div");
			divContainer1.id = "row_"+i+"_column_"+j+"_1";
			divContainer1.className = "grid-item";
			divContainer1.innerText = arr[j][4 - i];

			var divContainer2 = document.createElement("div");
			divContainer2.id = "row_"+i+"_column_"+j+"_2";
			divContainer2.className = "grid-item";
			divContainer2.innerText = arr[4 - i][4 - j];

			var divContainer3 = document.createElement("div");
			divContainer3.id = "row_"+i+"_column_"+j+"_3";
			divContainer3.className = "grid-item";
			divContainer3.innerText = arr[4 - j][i];

			document.getElementById("board-0").appendChild(divContainer);
			document.getElementById("board-1").appendChild(divContainer1);
			document.getElementById("board-2").appendChild(divContainer2);
			document.getElementById("board-3").appendChild(divContainer3);

		}
	}

	$(document).ready(function() {
		var durationInMilli = document.setupTime * 60000 + 1000;
		var end = new Date((new Date()).getTime() + durationInMilli);
		document.endtime = end;
		initializeClock();
	});

	toggleVisiblePage(Pages.inGame);
}

function rotateBoard(direction){
	//hide current rotation
	var currRotation = "board-"+document.currRotation;
	document.getElementById(currRotation).style.display = "none";
	//advance
	currRotation = (document.currRotation + direction) % 4;
	if(currRotation == -1) currRotation = 3;

	//show next rotation
	var nextRotation = "board-"+currRotation;
	document.getElementById(nextRotation).style.display = "grid";

	//save
	document.currRotation = currRotation;

	//fix highlighting
	if(document.lastHighlighted)
		highlightBoard(document.lastHighlighted);

}	

function togglePause(isPaused){
	// Pause
	if(isPaused){
		document.remaining = getTimeRemaining(document.endtime).total;
		document.getElementById("pause").style.display = "none";
		document.getElementById("play").style.display = "";
		document.getElementById("finishedBoard").style.display = "none";
		document.getElementById("wordInputDiv").style.display = "none";

		clearInterval(document.timeinterval);
	}

	// Play
	else{

		var end = new Date((new Date()).getTime() + document.remaining);
		document.endtime = end;

		initializeClock();
		document.getElementById("pause").style.display = "";
		document.getElementById("play").style.display = "none";
		document.getElementById("finishedBoard").style.display = "";
		document.getElementById("wordInputDiv").style.display = "";

	}
}


function enterLetter(event,obj){
	if (event.key === "Enter") {
		if(obj.value != ""){
			submitWord(obj);
		}
	}
	else{
		let word = obj.value.toUpperCase();
		let lettersToHighlight = wordOnBoard(word);
		if(lettersToHighlight){
			document.lastHighlighted = lettersToHighlight;
			highlightBoard(lettersToHighlight);
		}
	}
}

/**
* Need to move ...
*/

function submitWord(obj){

	// Get word
	let word = obj.value

	// Reset to blank
	obj.value = ""

	// Add word to list, if word
	if(isWord(word.toLowerCase())){
		appendWordToTable(word.toUpperCase());
	}
	
	removeHighlightingFromAll();

}

function appendWordToTable(word){

	var wordScore = getScore(word);

	var tableRow  = document.createElement("tr");
	tableRow.id = word;

	var wordCell =  document.createElement("td");
	wordCell.innerText = word;
	var scoreCell =  document.createElement("td");
	scoreCell.innerText = wordScore;

	tableRow.appendChild(wordCell);
	tableRow.appendChild(scoreCell);

	document.getElementById("wordList").appendChild(tableRow);
}

function toggleVisiblePage(visiblePage){
	Object.keys(Pages).forEach((page)=>{
		// make all elems visible
		if(page == visiblePage){
			document.pages[page].forEach((toShow)=>{
				document.getElementById(toShow).style.display = "";
			});
		}

		// hide
		else{
			document.pages[page].forEach((toHide)=>{
				document.getElementById(toHide).style.display = "none";
			});
		}
	})
}