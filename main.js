document.numberOfPlayers = 1;
document.submittedWords = [];
document.currRotation = 0;
document.over = new Set();
document.word = "";

const MessageType = Object.freeze({
    "joinGame": "joinGame",
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
    "contributions": "contributions"
});
document.pages = {};
document.pages[Pages.mainMenu] = ["mainMenu_container"];
document.pages[Pages.setupSinglePlayer] = ["setupSinglePlayer_container", "leftMenu_setup"];
document.pages[Pages.setupMulti] = ["setupMulti_container", "leftMenu_setup_multi", "pacman_container"];
document.pages[Pages.game] = ["game_container"];
document.pages[Pages.highScores] = ["highScores_container"];
document.pages[Pages.contributions] = ["contributions_container"];

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
    document.getElementById("wordInputDiv").style.display = "none";
    // document.uniqueWords = copyArr(document.words);

    if (!document.isSinglePlayerGame) {
        // document.allWords = [];
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

    } else {
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

function startGame(isMulti) {

 document.currRotation = 0;
 document.score = 0;
 document.getElementById("score").innerText = document.score;
 document.getElementById("playAgainButton").style.display = "none";

    // auto focus on input box when starting game
    window.setTimeout(function() {
        var elem = document.getElementById("wordsInput");
        elem.focus();
    }, 0);

    document.words = []
    document.uniqueWords = []
    var arr = document.board;
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {

            var divContainer = createLetterDiv(arr[i][j],i,j,0);
            // divContainer.ontouchend = ()=>{
            //     alert(arr[i][j]);
            // }
            var divContainer1 = createLetterDiv(arr[j][4 - i],i,j,1);
            var divContainer2 = createLetterDiv(arr[4 - i][4 - j],i,j,2);
            var divContainer3 = createLetterDiv(arr[4 - j][i],i,j,3);

            // addMouseOver(divContainer);

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
    if (isMulti){
       document.getElementById("pause").style.display = "none";
   }
   else 
       document.getElementById("pause").style.display = "";

   setupMobile();

   document.getElementById("finishedBoard").addEventListener("ontouchend", function(event) {
    alert('finished');
});
}

function doTouch(e){
    // alert('happened');
}
function doMouseOver(e){
    // alert(e);
    // console.log(e);
}

function addMouseOver(divContainer,i,j,value){

//     var letter = divContainer.innerText;
//     divContainer.ontouchstart = (e) => {
//         var str = "START:"+letter+" "+i+" "+j+" "+value;
//         document.dragArr = [str];
//     // document.startDrag = divContainer.innerText
//     // document.dragged = [divContainer.innerText];
// };

// divContainer.ontouchmove = (e) => {

//     var str = "MOVE:"+letter+" "+i+" "+j+" "+value;
//     document.dragArr.push(str);

//         // document.dragged.push(divContainer.innerText);
//     }

//     divContainer.ontouchend = (e) => {

//         var str = "END:"+letter+" "+i+" "+j+" "+value;
//         document.dragArr.push(str);
//         alert(document.dragArr);
//         alert(e);
//     }
}

function setupMobile(){
    var mobile = document.isMobile ? "" : "none";
    var browser = (!document.isMobile) ? "" : "none";

    document.getElementById("leftMenu_ingame").style.display = browser;
    document.getElementById("mainMenu_ingame").style.display = browser;
    document.getElementById("google-login").style.display = browser;

    document.getElementById("sidebar_words_mobile_button").style.display = mobile;
    document.getElementById("sidebar_words_mobile_button").style.display = mobile;
    document.getElementById("mainMenu_ingame_mobile").style.display = mobile;
    document.getElementById("submit_word_mobile").style.display = mobile;
    document.getElementById("remove_letter_mobile").style.display = mobile;
    document.getElementById("score_mobile").style.display = mobile;

    if(document.isMobile){

        document.getElementById("center").style.marginTop = "5vh"
    }
}

function createLetterDiv(val,i,j,rot){
    var divContainer = document.createElement("div");
    divContainer.id = "row_" + i + "_column_" + j + "_"+rot;
    divContainer.className = "grid-item dragProps";
    divContainer.innerText = val;
    divContainer.onmouseover= ()=>{
        // document.doMouseOver.push(val);
    }
    divContainer.ontouchend= (event)=>{
        // alert(document.over)
    }

    divContainer.onmousedown = (event)=>{
        enterLetterViaClick(event.srcElement)
    };


    divContainer.draggable = "true";
    var id = divContainer.id;
    divContainer.ondragover = (event) =>{
        if(!document.over.has(id)){
            document.word += val;
        }
        document.over.add(divContainer.id);
        // console.log(val);
        // console.log(event)
    }

    // divContainer.ondragstart = () => {
    //     divContainer
    // }

    divContainer.ondragend = (event) =>{
        alert(document.word);
        document.word = "";
        document.over = new Set();
        // console.log(val);
        // console.log(event)
    }

    addMouseOver(divContainer,i,j,val);


//     divContainer.onmousedown = (event)=>{
//         enterLetterViaClick(event.srcElement)
//     };

//     divContainer.ontouchstart = (e) => {
//         alert(letter);
//     };

//     divContainer.ontouchmove = (e) => {
//         alert(letter);
//         // document.dragged.push(divContainer.innerText);
//     }

//     divContainer.ontouchend = (e) => {

//     // alert( document.dragged);
//     alert(letter);

// }

return divContainer;
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

    removeHighlightingFromAll();
}

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

    if(document.isMobile){
        document.getElementById("wordList_mobile").appendChild(tableRow);
    }
    else 
        document.getElementById("wordList").appendChild(tableRow);
}

function ensureAllPagesLoaded(callback) {
    if (document.hasLoaded){
        if( isMobile.any() ){
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

function toggleVisiblePage(visiblePage) {

    var loadPage = function() {
        Object.keys(Pages).forEach((page) => {
            document.page
            // make all elems visible
            if (page == visiblePage) {
                document.pages[page].forEach((toShow) => {
                    document.getElementById(toShow).style.display = "";
                });
            }

            // hide
            else {
                document.pages[page].forEach((toHide) => {
                    document.getElementById(toHide).style.display = "none";
                });
            }
        })
    };

    ensureAllPagesLoaded(loadPage);
}

function postHighScore(score, board, words) {

    var username = "anonymous";

    let timeInUTC = new Date(Date.now()).getTime();
    var avatar = "https://ssl.gstatic.com/docs/common/profile/badger_lg.png";

    //user is signed in
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        username = document.username;
        avatar = document.avatar;
    } else return;

    let values = [
    [score, username, timeInUTC, avatar,
    JSON.stringify(board), JSON.stringify(words)
    ]
    ];

    sendScore(values);
}

function sendScore(values) {
    const resource = {
        values: values,
        majorDimension: "ROWS"
    };

    console.log(values);

    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:F',
        valueInputOption: "USER_ENTERED",
        resource: resource
    }).then(function(response) {
        console.log(response)
    }, function(response) {});
}