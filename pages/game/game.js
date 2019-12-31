function rotateBoard(direction) {
    //hide current rotation
    var currRotation = "board-" + document.currRotation;
    document.getElementById(currRotation).style.display = "none";

    //advance
    currRotation = (document.currRotation + direction) % 4;
    if (currRotation == -1) currRotation = 3;

    //show next rotation
    var nextRotation = "board-" + currRotation;
    document.getElementById(nextRotation).style.display = "grid";

    //save
    document.currRotation = currRotation;

    //fix highlighting
    if (document.lastHighlighted)
        highlightBoard(document.lastHighlighted);
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
    if (event.key === "Enter") {
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

function mainMenu() {
    // Stop timer & set to zeros
    togglePause(0);
    clearInterval(document.timeinterval);
    document.remaining = null;

    // Remove words
    removeWords();

    // Remove Tiles
    removeBoardTiles();

    // Go to main menu
    toggleVisiblePage(Pages.mainMenu);
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
            changeSetupState(SetupStates.waitingForStart);
        }

        changeSetupState(SetupStates.waitingForStart);

        toggleVisiblePage(Pages.setupMulti);
    }
    // play single player
    else {
        // show entry input box and remove play again button
        document.getElementById("wordInputDiv").style.display = "";
        document.getElementById("playAgainButton").style.display = "none";

        startGame();
    }
}