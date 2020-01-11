function setupGame(isMulti) {
    document.currRotation = 0;
    document.score = 0;
    document.fakeWords = []
    document.endGame = false;
    document.getElementById("score").innerText = document.score;
    document.getElementById("playAgainButton").style.display = "none";

    // auto focus on input box when starting game
    setFocusOnInput();

    document.words = []
    document.uniqueWords = []
    var arr = document.board;
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {

            var divContainer = createLetterDiv(arr[i][j], i, j, 0);
            var divContainer1 = createLetterDiv(arr[j][4 - i], i, j, 1);
            var divContainer2 = createLetterDiv(arr[4 - i][4 - j], i, j, 2);
            var divContainer3 = createLetterDiv(arr[4 - j][i], i, j, 3);

            document.getElementById("board-0").appendChild(divContainer);
            document.getElementById("board-1").appendChild(divContainer1);
            document.getElementById("board-2").appendChild(divContainer2);
            document.getElementById("board-3").appendChild(divContainer3);

        }
    }

    $(document).ready(function() {
        setClockEnd();
        initializeClock();
    });

    // cannot pause in a multiplayer game
    if (isMulti) {
        document.getElementById("pause").style.display = "none";
    } else
    document.getElementById("pause").style.display = "";
    document.getElementById("wordInputDiv").style.display = "";

    // document.getElementById("wordsInputDiv").style.display = "";

    setupMobile();
}

function isWord(word){
		var isEnglishWord = document.wordlist.indexOf(word) != -1;
		var lengthGreaterThanThree = word.length > 3;
		var isWordAlreadySubmitted = document.submittedWords.indexOf(word);

		if(!lengthGreaterThanThree){
			alert("Words must be at least 4 characters"); 
			return false
		}
		if(!isEnglishWord){
			alert(word+" is not a valid English word");
			// Track words submitted that are not english
			document.fakeWords.push(word);
			return false;
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