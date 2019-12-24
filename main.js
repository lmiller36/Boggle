	
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

	document.numberOfPlayers = 1;

	function isWord(word){
		var isEnglishWord = document.wordlist.indexOf(word) != -1;
		var lengthGreaterThanThree = word.length > 3;
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
		return true;
	}

	function wordOnBoard(word){
		console.log(word);
		var loc = findNextLetter(0,word,[],null);
		console.log(loc);
		return loc;
	}

	function findNextLetter(index, word, used,prev){
		if(index == word.length)
			return used;
		var goal = word.substring(index,index + 1);
		console.log(goal);
		for(var i = 0;i < document.board.length;i++){
			for(var j = 0; j < document.board[i].length;j++){
				var letter = document.board[i][j];
				var usedAlready = 0;
				used.forEach((arr)=>{
					if(arr[0] == i && arr[1] == j)
						usedAlready = 1;
				})
				if(letter == goal && !usedAlready && isNeighbor([i,j],prev)){
					var copy = copyArr(used);
					copy.push([i,j]);
					var output = findNextLetter(index + 1, word,copy,[i,j]);
					if(output){
						return output;
					}
				}
			}
		}

		return false;
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
		let word = obj.value.toUpperCase();

		// Reset to blank
		obj.value = ""

		// Add word to list, if word
		if(isWord(word.toLowerCase())){
			var listElement  = document.createElement("li");
			listElement.id = word;
			listElement.innerText = word;
			document.getElementById("wordList").appendChild(listElement);
		}

	}

	function shuffledBoard(){
		// copy dice
		var newBoardDice = JSON.parse(JSON.stringify(document.tiles));
		// shuffle dice
		newBoardDice.sort(function() {
			return .5 - Math.random();
		});

		// iterate over dice and choose a random letter from each
		var board = [];
		var arr ;
		for(var i = 0; i < newBoardDice.length;i++){
			var str = newBoardDice[i];
			if(i % 5 == 0) arr = [];
			var index = Math.floor(Math.random() * str.length);
			var letter = str.substring(index,index+1);
			//Q => QU
			if(letter == "Q") letter = "QU";
			arr.push(letter.toUpperCase());
			if((i+1) % 5 == 0) board.push(arr);
		}

		// return random board
		return board;
	}

	function changeNumberOfPlayers(change){
		document.numberOfPlayers = Math.max(1,document.numberOfPlayers + change);
		document.getElementById("numPlayers").innerText = "Number of players: "+document.numberOfPlayers;
	}

	function submitBoard(){
		// var arr = [];
		// console.log(arr);
		// var finished = 1;
		// for(var i = 1; i <= 5;i++){
		// 	var line = []
		// 	// arr.push([]);
		// 	for(var j = 1; j <= 5; j++){
		// 		var name = "setup_tile_"+j+"_"+i;
		// 		var value = document.getElementById(name).value;
		// 		if(value == "") finished = 0;
		// 		line.push(value);
		// 	}
		// 	arr.push(line);
		// }
		// document.letters = arr;

		var shuffled = shuffledBoard();



		finished = 1;
		arr = shuffled;
		if(finished){
			document.board = arr;
			for(var i = 0; i < 5; i++){
				for(var j = 0; j < 5; j++){
					var divContainer = document.createElement("div");
					divContainer.id = "row_"+i+"_column_"+j;
					divContainer.className = "grid-item";
					divContainer.innerText = arr[i][j];
					document.getElementById("grid-container").appendChild(divContainer);
				}
			}

			document.getElementById("setup").style.display = "none";
			// document.getElementById("setupNumPlayers").style.display = "none";
			// document.getElementById("submitSetupButton").style.display = "none";
			document.getElementById("game").style.display = "";
		}

	}