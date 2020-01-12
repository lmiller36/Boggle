function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

function togglePause(isPaused) {
    // Pause
    if (isPaused) {
        document.remaining = getTimeRemaining(document.endtime).total;
        document.getElementById("pause").style.display = "none";
        document.getElementById("play").style.display = "";
        document.getElementById("finishedBoard").style.display = "none";
        document.getElementById("wordInputDiv").style.display = "none";

        clearInterval(document.timeinterval);
    }

    // Play
    else {

        var end = new Date((new Date()).getTime() + document.remaining);
        document.endtime = end;
        initializeClock();
        document.getElementById("pause").style.display = "";
        document.getElementById("play").style.display = "none";
        document.getElementById("finishedBoard").style.display = "";
        document.getElementById("wordInputDiv").style.display = "";
    }
}

function enterLetter(event, obj) {
    if (event && event.key === "Enter") {
        if (obj.value != "") {
            submitWord(obj);
        }
    } else {
        let word = obj.value.toUpperCase();
        let lettersToHighlight = wordOnBoard(word);
        if (lettersToHighlight) {
            document.lastHighlighted = lettersToHighlight;
            highlightBoard(lettersToHighlight);
        }
    }
}

function playAgain() {
    document.hasTallied = false;
    document.allWords = [];
    document.submittedWords = [];
    document.getElementById("wordInputDiv").style.display = "";

    // Remove words
    removeWords();

    // New board
    document.board = shuffledBoard();

    // Remove Tiles
    removeBoardTiles();

    // play multiplayer again
    if (!document.isSinglePlayerGame) {

        // Hide words
        document.getElementById("opponentsWords_container").style.display = "none";
        removeAllChildren("opponentsWords-head-row");
        removeAllChildren("opponentsWords-rows");

        if (!document.isHost) {
            document.channel = document.replayChannel;
            joinChannel();
        }

        multiplayer();
    }
    // play single player
    else {
        // show entry input box and remove play again button
        document.getElementById("wordInputDiv").style.display = "";
        document.getElementById("playAgainButton").style.display = "none";

        game();
    }
}

function setFocusOnInput(){
 window.setTimeout(function() {
    var elem = document.getElementById("wordsInput");
    elem.focus();
}, 0);
}

function removeLetter(){
    var input = document.getElementById("wordsInput");
    var word = input.value.toUpperCase();

    if(word.length > 0)
    {
        var wordMinusChar = word.substring(0,word.length - 1);

        if(word.length == document.lastHighlighted.length){
            var remainder = document.lastHighlighted.splice(0,wordMinusChar.length);
            highlightBoard(remainder);
            document.lastHighlighted = remainder;
        }
        input.value = wordMinusChar;
    }
}

function removeLetter(){
    var input = document.getElementById("wordsInput");
    var word = input.value.toUpperCase();

    if(word.length > 0)
    {
        var wordMinusChar = word.substring(0,word.length - 1);

        if(word.length == document.lastHighlighted.length){
            var remainder = document.lastHighlighted.splice(0,wordMinusChar.length);
            highlightBoard(remainder);
            document.lastHighlighted = remainder;
        }
        input.value = wordMinusChar;
    }
}

/* Functions for mobile */ 
function submitViaButton(){
    var wordElem = document.getElementById("wordsInput");
    if(wordElem.value == "") return;
    submitWord(wordElem);
    document.lastHighlighted = [];
}

function enterLetterViaClick(clickedTile){

 // check if game over
 if(document.endGame) return;

 var arr = clickedTile.id.split("_");
 var i,j,rot;
 i = parseInt(arr[1]);
 j = parseInt(arr[3]);
 rot = (document.currRotation + 2) % 4;

 var input = document.getElementById("wordsInput");

 var letter = clickedTile.innerText;
 var word = input.value + letter;

  // set focus on input to allow easy entering
  setFocusOnInput();
    // check if can highlight, but we will enforce that 
    // the correct letter is highlighted
    if(wordOnBoard(word)){
          // if letter is same as previous, it will be removed
          console.log(document.lastHighlighted);
          console.log(arr)
          console.log(adjustCoordinates([i,j]))

          input.value = word;
          if(!document.lastHighlighted) document.lastHighlighted = [];

          var coords = [i,j,true]
          document.lastHighlighted.push(coords);

          highlightBoard(document.lastHighlighted);
      }
  }