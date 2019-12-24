document.numberOfPlayers = 1;
document.submittedWords = [];
document.currRotation = 0;

const Pages = Object.freeze({"mainMenu":"mainMenu", "inGame":"inGame","setup":"setup"});
document.pages = {};
document.pages[Pages.mainMenu] = ["mainMenu"];
document.pages[Pages.setup] = ["setup","leftMenu_setup"];
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


	function mainMenu(){
		// Stop timer & set to zeros
		togglePause(0);
		clearInterval(document.timeinterval);
		document.remaining = null;
		setClock("00","00");

		// Unpause if paused

		// Remove Tiles
		removeBoardTiles();

		// Go to main menu
		toggleVisiblePage(Pages.mainMenu);
	}

	function setup(){
		document.setupTime = 5;
		toggleVisiblePage(Pages.setup);
	}

	function getTimeRemaining(endtime){
		var t = Date.parse(endtime) - Date.parse(new Date());
		var seconds = Math.floor( (t/1000) % 60 );
		var minutes = Math.floor( (t/1000/60) % 60 );
		var hours = Math.floor( (t/(1000*60*60)) % 24 );
		var days = Math.floor( t/(1000*60*60*24) );

		return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		};
	}

	function initializeClock(){
		setClock("00","00");
		var timeinterval = setInterval(function(){
			var endtime = document.endtime;
			var t = getTimeRemaining(endtime);

			setClock(t.minutes,t.seconds);

			if(t.total<=0){
				clearInterval(timeinterval);
			}
		},1000);
		document.timeinterval = timeinterval;
	}

	function setClock(minutes,seconds){
		var clock = document.getElementById("clockdiv");

		if(minutes == 0)minutes = "00";
		else if(minutes <= 9)minutes = "0" + minutes;
		if(seconds == 0) seconds = "00";
		else if(seconds <= 9) seconds = "0" + seconds;

		var minutesSpan = clock.querySelector('.minutes');
		var secondsSpan = clock.querySelector('.seconds');
		minutesSpan.innerHTML = minutes;
		secondsSpan.innerHTML = seconds;
	}

	function setClock_setup(minutes,seconds){
		var clock = document.getElementById("clockdiv_setup");

		if(minutes == 0)minutes = "00";
		else if(minutes <= 9)minutes = "0" + minutes;
		if(seconds == 0) seconds = "00";
		else if(seconds <= 9) seconds = "0" + seconds;

		var minutesSpan = clock.querySelector('.minutes');
		var secondsSpan = clock.querySelector('.seconds');
		minutesSpan.innerHTML = minutes;
		secondsSpan.innerHTML = seconds;
	}

	function isWord(word){
		var isEnglishWord = document.wordlist.indexOf(word) != -1;
		var lengthGreaterThanThree = word.length > 3;
		var isWordAlreadySubmitted = document.submittedWords.indexOf(word);
		if(!isEnglishWord){
			alert(word+" is not a valid English word");
			return false;
		}
		if(!lengthGreaterThanThree){
			alert("Words must be at least 4 characters"); 
			return false
		}
		if(!wordOnBoard(word.toUpperCase())){
			alert(word+" not possible");
			return false; 
		}

		if(isWordAlreadySubmitted != -1){
			alert(word+" was already submitted");
			return false; 
		}

		document.lastHighlighted = null;
		document.submittedWords.push(word)
		return true;
	}

	function wordOnBoard(word){
		//q check
		var qIndex = word.indexOf("Q");
		if(qIndex != -1){
			var next = word.substring(qIndex+1,qIndex + 2);
			if(next != "U") return null;
		}

		var loc = findNextLetter(0,word,[],null);

		return loc;
	}

	function findNextLetter(index, word, used,prev){
		if(index == word.length)
			return used;
		var goal = word.substring(index,index + 1);
		var add = 1;

		// if letter is Q => next is guaranteed to be a "U", so can skip
		if(goal == "Q") {
			goal = "QU";
			add = 2;
		}

		for(var i = 0;i < document.board.length;i++){
			for(var j = 0; j < document.board[i].length;j++){
				var letter = document.board[i][j];
				var usedAlready = 0;
				used.forEach((arr)=> {
					if(arr[0] == i && arr[1] == j)
						usedAlready = 1;
				})
				if(letter == goal && !usedAlready && isNeighbor([i,j],prev)){
					var copy = copyArr(used);
					copy.push([i,j]);

					var output = findNextLetter(index + add, word,copy,[i,j]);
					if(output){
						return output;
					}
				}
			}
		}

		return null;
	}

	function isNeighbor(curr,prev){
		if(prev == null) return true;

		var diffI = Math.abs(curr[0] - prev[0]);
		var diffJ = Math.abs(curr[1] - prev[1]);

		return diffI <= 1 && diffJ <= 1;
	}

	function copyArr(arr){
		return JSON.parse(JSON.stringify(arr));
	}

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

	function getScore(word){
		if(word.length == 4) return 1
			if(word.length == 5) return 2;
		if(word.length == 6) return 3;
		if(word.length == 7) return 5;
		if(word.length >= 8 )return 11;

		return -1;
	}

	function changeTime(change){
		var time = document.setupTime
		time += change;
		if(time > 5) time = Math.min(10,time);
		else time = 5;



		setClock_setup(time,0);

		document.setupTime = time;
	}

	function startGame(){

		var shuffled = shuffledBoard();

		finished = 1;
		arr = shuffled;
		if(finished){
			document.board = arr;
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

			toggleVisiblePage(Pages.inGame);


			// for(var i = 0; i <= 50;i ++){
			// 	var random = Math.round(Math.random() * 100) + "";
			// 	appendWordToTable(random);
			// }

		}

		$(document).ready(function() {
			var durationInMilli = document.setupTime * 60000 + 1000;
			var end = new Date((new Date()).getTime() + durationInMilli);
			document.endtime = end;
			initializeClock();
		});
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

	function adjustCoordinates(coords){
		switch(document.currRotation){
			case 0:
			return coords;
			case 3:
			return [coords[1],4 - coords[0]]
			case 2:
			return [4 - coords[0], 4 - coords[1]];
			case 1:
			return [4 - coords[1],coords[0]];
		}
	}