document.numberOfPlayers = 1;
document.submittedWords = [];
document.currRotation = 0;

const MessageType = Object.freeze({"joinGame":"joinGame","booted":"booted","unsubscribe":"unsubscribe","initialBoards":"initialBoards","endGame":"endGame"});
const Pages = Object.freeze({"mainMenu":"mainMenu", "game":"game","setupSinglePlayer":"setupSinglePlayer","setupMulti":"setupMulti","highScores":"highScores","contributions":"contributions"});
document.pages = {};
document.pages[Pages.mainMenu] = ["mainMenu_container"];
document.pages[Pages.setupSinglePlayer] = ["setupSinglePlayer_container","leftMenu_setup"];
document.pages[Pages.setupMulti] = ["setupMulti_container","leftMenu_setup_multi"];
document.pages[Pages.game] = ["game_container","leftMenu_ingame","pause"];
document.pages[Pages.highScores] = ["highScores_container"];
document.pages[Pages.contributions] = ["contributions_container"];

// load pages
$( document ).ready(function() { 
	Object.keys(Pages).forEach((page)=>{
		var link = document.getElementById(page + '_import');
		var content = link.import;

		var el = content.querySelector('.'+page);
		document.getElementById(page+"_container").appendChild(el.cloneNode(true));
	});

	// load pacman
	var pacmanlink = document.getElementById('pacman_import');
	var content = pacmanlink.import;

	var el = content.querySelector('.pacman_svg');
	document.getElementById("pacman_container").appendChild(el.cloneNode(true));
});

// load data
$.ajax({
	url: "data/tiles.txt",
	dataType: "JSON",
	success: function(data) {
		document.tiles = data;
	}
});

// $.ajax({
// 	url: "data/avatars.txt",
// 	dataType: "JSON",
// 	success: function(data) {
// 		document.avatars = data;
// 	}
// });

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
	document.getElementById("wordInputDiv").style.display = "none";
	// document.uniqueWords = copyArr(document.words);

	if(!document.isSinglePlayerGame){
		// document.allWords = [];
		if(!document.allWords)document.allWords = [];
		document.allWords.push({
			"sender": document.me,
			"words": document.words,
			"username": document.username,
		});

		var msg = {
			"words":document.words,
			"sender":document.me,
			"username" :document.username
		};

		sendMessage(msg,MessageType.endGame);

		// Show scores if all responses not received in 3 seconds
		var countDown = 5;
		var x = setInterval(function() {
			countDown--;

		  // If the count down is finished, write some text
		  if (countDown == 0) {
		  	console.log("clear")
		  	clearInterval(x);
		  	tallyScores();
		  }
		}, 1000);

	}
	else{
		alert("Your score is "+document.score);
		postHighScore(document.score,document.board,document.words);
		document.getElementById("playAgainButton").style.display = "";
	}
}

function tallyScores(){
	console.log("tallied");
	if(document.hasTallied) return;

	document.hasTallied = true;
	document.getElementById("playAgainButton").style.display = "";

	var scoresReceived = document.allWords.length;

	var sets = [];
	var unique = [];
	var scores = [];
	var maxLength = 0;
	var myIndex = -1;

	var namesHeader = document.getElementById("opponentsWords-head-row");
	var count = 0;
	document.allWords.forEach((obj)=>{
		if(obj.sender == document.me){
			myIndex = count;
		}
		var th = document.createElement("th");
		th.innerText = obj.username;
		namesHeader.appendChild(th);

		var wordList = obj.words;
		maxLength = Math.max(maxLength,wordList.length);
		scores.push(0);
		sets.push(new Set(wordList));
		count++;
	})

	var opponentsWords = document.getElementById("opponentsWords-rows");

	var unique = [];

	for(var i = 0;i < scoresReceived;i++){
		var currUnique = new Set(sets[i]);
		for(var j = 0;j < scoresReceived;j++){
			if(i != j){
				currUnique = currUnique.difference(sets[j]);
			}
		}
		unique.push(currUnique);
	}

	for(var i = 0; i < maxLength;i++){
		var row = document.createElement("tr");
		row.className = "element";

		for(var j = 0;j < scoresReceived;j++){

			var entry = document.createElement("td");
			var word = "";
			if(i < document.allWords[j].words.length){
				word = document.allWords[j].words[i];
				 // is not unique
				 if(!unique[j].has(word)){
				 	entry.style.textDecoration = "line-through"
				 }
				 else{
				 	scores[j] += getScore(word);
				 }
				}
				entry.innerText = word.toUpperCase();
				entry.className = "font";
				row.appendChild(entry);
			}

			opponentsWords.appendChild(row);
		}

		// add scores
		var score_row = document.createElement("tr");
		score_row.className = "element";

		scores.forEach((score)=>{
			var entry = document.createElement("td");
			entry.innerText = score;
			entry.className = "font"
			entry.style.textAlign = "center";

			score_row.appendChild(entry);
		});

		opponentsWords.appendChild(score_row);
		document.getElementById("opponentsWords_container").style.display = "";

		alert("Your score is "+scores[myIndex])
	}

	function bootMe(){
		unsubscribe();

		document.getElementById("exitMultiplayer").style.display = "none";
		document.getElementById("join_id").style.display = "";
		document.getElementById("hasJoined").style.display = "none";
	}

	function startGame(isMulti){
		document.score = 0;
		document.hasTallied = false;
		document.getElementById("score").innerText = document.score;
		document.getElementById("playAgainButton").style.display = "none";

		document.words = []
		document.uniqueWords = []
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
			var durationInMilli = document.setupTime + 1000;
			var end = new Date((new Date()).getTime() + durationInMilli);
			document.endtime = end;
			initializeClock();
		});

		toggleVisiblePage(Pages.game);

	// cannot pause in a multiplayer game
	if(isMulti) document.getElementById("pause").style.display = "none";
}

function submitWord(obj){
	// Get word
	let word = obj.value

	// Reset to blank
	obj.value = ""

	// Add word to list, if word
	if(isWord(word.toLowerCase())){
		appendWordToTable(word.toUpperCase());
		document.score += getScore(word);
		document.words.push(word);
		document.uniqueWords.push(word);
		document.getElementById("score").innerText = document.score;
	}
	
	removeHighlightingFromAll();
}

function appendPlayerToTable(playerId){

	var tableRow  = document.createElement("tr");
	var id = "id_"+playerId;
	tableRow.id = id;

	var idCell =  document.createElement("td");
	idCell.innerText = playerId;

	var xCell =  document.createElement("td");

	var xIcon = document.createElement("i");
	xIcon.className = "fa fa-times";


	xIcon.id = "x_"+playerId;

	xIcon.addEventListener("click",function(event){
		bootPlayer(playerId);
		removeNode(id);
	});

	xCell.appendChild(xIcon);

	tableRow.appendChild(idCell);
	tableRow.appendChild(xCell);

	document.getElementById("playersList").appendChild(tableRow);
}

function appendWordToTable(word){

	var wordScore = getScore(word);

	var tableRow  = document.createElement("tr");
	tableRow.id = "word_"+word;

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

function postHighScore(score,board,words){

	var username = "anonymous";

	let timeInUTC = new Date(Date.now()).getTime();
	var avatar = "https://ssl.gstatic.com/docs/common/profile/badger_lg.png";

    //user is signed in
    if(gapi.auth2.getAuthInstance().isSignedIn.get()){
    	username = document.username;
    	avatar = document.avatar;
    }
    else return;

    let values = [[score,username,timeInUTC,avatar,
    JSON.stringify(board),JSON.stringify(words)]];

    sendScore(values);
}

function sendScore(values){
	const resource = {
		values:values,
		majorDimension: "ROWS"
	};

	console.log(values);

	gapi.client.sheets.spreadsheets.values.append({
		spreadsheetId: SHEET_ID,
		range: 'Sheet1!A:F',
		valueInputOption:"USER_ENTERED",
		resource:resource
	}).then(function(response) {
		console.log(response)
	}, function(response) {
	});
}