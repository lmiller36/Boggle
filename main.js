	
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
	document.submittedWords = [];
	document.currRotation = 0;

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

		removeHighlightingFromAll();
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

		return board;
	}

	function changeNumberOfPlayers(change){
		document.numberOfPlayers = Math.max(1,document.numberOfPlayers + change);
		document.getElementById("numPlayers").innerText = "Number of players: "+document.numberOfPlayers;
	}

	function submitBoard(){

		var shuffled = shuffledBoard();

				// arr1.push(document.board[j][4 - i]);
				// arr2.push(document.board[4 - i][4-j]);
				// arr3.push(document.board[4 - j][i]);

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

					document.getElementById("setup").style.display = "none";
					document.getElementById("game").style.display = "";
				}

			}

			function highlightBoard(obj){
				let word = obj.value.toUpperCase();
				let lettersToHighlight = wordOnBoard(word);
				if(lettersToHighlight){
					removeHighlightingFromAll();

					lettersToHighlight.forEach((coords)=>{
						highlightLetter(coords[0],coords[1]);
					})

				}
			}

			function removeHighlightingFromAll(){
				for(var rot = 0; rot < 4;rot++){
					for(var i = 0;i<5;i++){
						for(var j = 0;j<5;j++){
							var id = "row_"+i+"_column_"+j+"_"+rot;
							var div = document.getElementById(id);
							div.style.border = "1px solid rgba(0, 0, 0, 0.8)";
							div.style.background = "rgba(255, 255, 255, 0.8)";
						}
					}
				}
			}
			function highlightLetter(row,col){
				var id = "row_"+row+"_column_"+col+"_"+document.currRotation;
				var div = document.getElementById(id);
				div.style.border = "white 1px solid";
				div.style.background = "white";
			}

			function rotateBoard(direction){
				console.log(direction);
				//hide current rotation
				var currRotation = "board-"+document.currRotation;
				console.log(currRotation);
				document.getElementById(currRotation).style.display = "none";
				console.log(document.getElementById(currRotation));
				//advance
				currRotation = (document.currRotation + direction) % 4;
				if(currRotation == -1) currRotation = 3;
				console.log(currRotation);

				//show next rotation
				var nextRotation = "board-"+currRotation;
				document.getElementById(nextRotation).style.display = "grid";
				console.log(nextRotation);
				console.log(document.getElementById(nextRotation));

				//save
				document.currRotation = currRotation;
			}