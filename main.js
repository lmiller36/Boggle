document.numberOfPlayers = 1;
document.submittedWords = [];
document.currRotation = 0;
document.uniqueTiles = {};

const MessageType = Object.freeze({
    "joinGame": "joinGame",
    "ackJoin": "ackJoin",
    "booted": "booted",
    "unsubscribe": "unsubscribe",
    "initialBoards": "initialBoards",
    "endGame": "endGame"
});
const Pages = Object.freeze({
    "mainMenu": "mainMenu",
    "game": "game",
    "setupSinglePlayer": "setupSinglePlayer",
    "setupMulti": "setupMulti",
    "highScores": "highScores",
    "contributions": "contributions",
    "404": "404"
});
document.pages = {};
document.pages[Pages.mainMenu] = ["mainMenu_container"];
document.pages[Pages.setupSinglePlayer] = ["setupSinglePlayer_container"];
document.pages[Pages.setupMulti] = ["setupMulti_container"];
document.pages[Pages.game] = ["game_container"];
document.pages[Pages.highScores] = ["highScores_container"];
document.pages[Pages.contributions] = ["contributions_container"];
document.pages["404"] = ["404_container"];


var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

function endGame() {
    document.endGame = true;
    /** Common tasks to single & multi player games **/

    // Hide input bar
    document.getElementById("wordInputDiv").style.display = "none";

    // Post fake words to server for later review
    postFakeWords(document.fakeWords);

    // Multi-player
    if (!document.isSinglePlayerGame) {
        if (!document.allWords) document.allWords = [];
        document.allWords.push({
            "sender": document.me,
            "words": document.words,
            "username": document.username,
        });

        var msg = {
            "words": document.words,
            "sender": document.me,
            "username": document.username
        };

        sendMessage(msg, MessageType.endGame);

        if (document.isHost) {
            document.otherPlayers = new Set();
            removeAllChildren("playersList");
        }

        // Show scores if all responses not received in 3 seconds
        var countDown = 5;
        var x = setInterval(function() {
            countDown--;

            // If the count down is finished, write some text
            if (countDown == 0) {
                clearInterval(x);
                tallyScores();
            }
        }, 1000);

    }
    // Single player
    else {
        alert("Your score is " + document.score);
        postHighScore(document.score, document.board, document.words);
        document.getElementById("playAgainButton").style.display = "";
    }
}

function tallyScores() {
    console.log("tallied");
    if (document.hasTallied) return;

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
    document.allWords.forEach((obj) => {
        if (obj.sender == document.me) {
            myIndex = count;
        }
        var th = document.createElement("th");
        th.innerText = obj.username;
        namesHeader.appendChild(th);

        var wordList = obj.words;
        maxLength = Math.max(maxLength, wordList.length);
        scores.push(0);
        sets.push(new Set(wordList));
        count++;
    })

    var opponentsWords = document.getElementById("opponentsWords-rows");

    var unique = [];

    for (var i = 0; i < scoresReceived; i++) {
        var currUnique = new Set(sets[i]);
        for (var j = 0; j < scoresReceived; j++) {
            if (i != j) {
                currUnique = currUnique.difference(sets[j]);
            }
        }
        unique.push(currUnique);
    }

    for (var i = 0; i < maxLength; i++) {
        var row = document.createElement("tr");
        row.className = "element";

        for (var j = 0; j < scoresReceived; j++) {

            var entry = document.createElement("td");
            var word = "";
            if (i < document.allWords[j].words.length) {
                word = document.allWords[j].words[i];
                // is not unique
                if (!unique[j].has(word)) {
                    entry.style.textDecoration = "line-through"
                } else {
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

    scores.forEach((score) => {
        var entry = document.createElement("td");
        entry.innerText = score;
        entry.className = "font"
        entry.style.textAlign = "center";

        score_row.appendChild(entry);
    });

    opponentsWords.appendChild(score_row);
    document.getElementById("opponentsWords_container").style.display = "";


    if (!document.isHost) {
        console.log(document.isHost);
        document.replayChannel = document.channel;
        unsubscribe();
    }

    alert("Your score is " + scores[myIndex]);
}

function bootMe() {
    unsubscribe();

    document.getElementById("exitMultiplayer").style.display = "none";
    document.getElementById("join_id").style.display = "";
    document.getElementById("hasJoined").style.display = "none";
}

function setupMobile() {
    var mobile = document.isMobile ? "" : "none";
    var browser = (!document.isMobile) ? "" : "none";

    document.getElementById("leftMenu_ingame").style.display = browser;
    document.getElementById("google-login").style.display = browser;
    document.getElementById("browser_controls_container").style.display = browser;
    document.getElementById("spacer_game").style.display = browser;


    document.getElementById("sidebar_words_mobile_button_endgame").style.display = mobile;
    document.getElementById("sidebar_words_mobile_button").style.display = mobile;
    document.getElementById("rotate1_mobile").style.display = mobile;
    document.getElementById("rotate2_mobile").style.display = mobile;
    document.getElementById("submit_word_mobile").style.display = mobile;
    document.getElementById("remove_letter_mobile").style.display = mobile;
    document.getElementById("score_mobile").style.display = mobile;

    if (document.isMobile) {
        document.getElementById("center").style.marginTop = "5vh"
    }
}

/** Find row & column, (x,y), in board **/
function getBoardTile(x, y) {
    var i, j;
    i = 0;
    while (i < 5) {
        j = 0;
        while (j < 5) {
            var id = "row_" + i + "_column_" + j + "_" + document.currRotation;
            var elem = document.getElementById(id);
            var bound = elem.getBoundingClientRect();
            var xMatch = x >= bound.left && x <= bound.right;
            var yMatch = y >= bound.top && y <= bound.bottom;
            if (xMatch && yMatch)
                return [id, elem.innerText];

            j++;
        }
        i++;
    }
}

function touchStart(event) {
    // get x, y & id of first touched tile
    var x = event.touches[0].clientX;
    var y = event.touches[0].clientY;
    var val = getBoardTile(x, y);
    var id = val[0];

    if (document.uniqueTiles[id] && document.uniqueTiles[id] == -1)
        return;
    // add letter
    enterLetterViaClick(document.getElementById(id))

    // -1 indicates tile has been highlighted
    document.uniqueTiles[id] = -1;

}

/** 
 * Called when user is touching device for mobile swiping.
 * Only considers a tile selected on swipe when it 
 * has been held on touch several times to 
 * combat false positives
 **/
function touchmove(event) {
    var x = event.touches[0].clientX;
    var y = event.touches[0].clientY;
    var val = getBoardTile(x, y);
    var id = val[0];

    if (!document.uniqueTiles[id]) document.uniqueTiles[id] = 1;
    else if (document.uniqueTiles[id] < 0) document.uniqueTiles[id] = -1;
    else document.uniqueTiles[id] += 1;

    // User has finger on tile long enough
    // to be considered selected
    if (document.uniqueTiles[id] == 4) {
        // -1 indicates tile has been highlighted
        document.uniqueTiles[id] = -1;

        enterLetterViaClick(document.getElementById(id))
    }
    event.preventDefault();
}

function endTouch(event) {
    var obj = document.getElementById("wordsInput");

    // only submit if > 1 letter has been dragged
    if (obj.value != "" && Object.keys(document.uniqueTiles).length > 1) {
        submitWord(obj);
    }

    // reset drag
    document.uniqueTiles = {};

}

function submitWord(obj) {
    // Get word
    let word = obj.value

    // Reset to blank
    obj.value = ""

    // Add word to list, if word
    if (isWord(word.toLowerCase())) {
        appendWordToTable(word.toUpperCase());
        document.score += getScore(word);

        document.words.push(word);
        document.uniqueWords.push(word);

        document.getElementById("score").innerText = document.score;
        document.getElementById("score_mobile_span").innerText = document.score;
    }

    // Ensure no highlighting is saved;
    document.lastHighlighted = [];

    removeHighlightingFromAll();
}

/** Adds a given player to setup multiplayer screen **/
function appendPlayerToTable(sender, username) {

    var tableRow = document.createElement("tr");
    var id = "id_" + sender;
    tableRow.id = id;

    var idCell = document.createElement("td");
    idCell.innerText = username;

    var xCell = document.createElement("td");

    var xIcon = document.createElement("i");
    xIcon.className = "fa fa-times";

    xIcon.id = "x_" + sender;

    xIcon.addEventListener("click", function(event) {
        bootPlayer(sender);
        removeNode(id);
    });

    xCell.appendChild(xIcon);

    tableRow.appendChild(idCell);
    tableRow.appendChild(xCell);

    document.getElementById("playersList").appendChild(tableRow);
}

/** Adds a given word to the corresponding wordlist in game **/
function appendWordToTable(word) {

    var wordScore = getScore(word);

    var tableRow = document.createElement("tr");
    tableRow.id = "word_" + word;

    var wordCell = document.createElement("td");
    wordCell.innerText = word;
    var scoreCell = document.createElement("td");
    scoreCell.innerText = wordScore;

    tableRow.appendChild(wordCell);
    tableRow.appendChild(scoreCell);

    if (document.isMobile)
        document.getElementById("wordList_mobile").appendChild(tableRow);
    else
        document.getElementById("wordList").appendChild(tableRow);
}

function ensureAllPagesLoaded(callback) {
    if (document.hasLoaded) {
        if (isMobile.any()) {
            document.isMobile = true;
        }
        callback();
    }

    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            document.hasLoaded = true;
            callback();
        }
    }, 10);
}