function joinGame() {
    document.getElementById("joinedPlayers").style.display = "none";
    document.getElementById("joinGame").style.display = "";
    document.getElementById("hostGame").style.display = "none";
    document.getElementById("waitingForHost").style.display = "none";

    grayPic1(true);

    if (document.username) {
        submitUsername();
    }
}

function hostGame() {

    grayPic1(false);

    if (!document.googleLoggedIn) {
        alert("You must be logged in with your Google account to host a game.")
        return;
    }

    document.getElementById("joinedPlayers").style.display = "none";
    document.getElementById("joinGame").style.display = "none";
    document.getElementById("hostGame").style.display = "";
    document.getElementById("waitingForHost").style.display = "none";

}

function createGame() {
    console.log("craete");
    createNewGame();
    showGamePlayers();
}

function showOnlineGames(){
    document.getElementById("hostGame").style.display = "none";
    document.getElementById("joinGame").style.display = "";
    document.getElementById("joinedPlayers").style.display = "none";
    document.getElementById("waitingForHost").style.display = "none";
}

function joinHost(gameID){
    document.getElementById("hostGame").style.display = "none";
    document.getElementById("joinGame").style.display = "none";
    document.getElementById("joinedPlayers").style.display = "none";
    document.getElementById("waitingForHost").style.display = "";

    //attempt to join game
    var countDown = 30;
    
    var x = setInterval(function() {

        // If the count down is finished, game could not be joined
        if (countDown == 0 || document.hostAckedJoin) {
            clearInterval(x);

            // Host ack'd
            if(document.hostAckedJoin){
                showGamePlayers();
            }

            // Game could could not be joined
            else {
                alert("Game could not be joined");
                showOnlineGames();
            }
        }

        unsubscribe();
        joinChannel(gameID);
        console.log(document.hostAckedJoin)
        countDown--;
    }, 1000);


}   

function showGamePlayers() {
    console.log("joined");

    document.getElementById("hostGame").style.display = "none";
    document.getElementById("joinGame").style.display = "none";
    document.getElementById("waitingForHost").style.display = "none";
    document.getElementById("joinedPlayers").style.display = "";

    if (document.isHost) {
        document.getElementById("startGameMultiButton").style.display = "";
    }
}

function addOnlineGames() {
    removeAllChildren("onlineGames-rows");
    readFromGoogleSheets('OnlineGames!A2:F', (response) => {
        var games = response.result.values;

        // if no games, return
        if (!games) return;

        var users = {};
        // get most recent game
        games.forEach((game) => {
            addOnlineGameRow(game);
        });
    })
}

function submitUsername() {
    console.log(document.username);
    document.getElementById("username_span").innerText = "Username: " + document.username
    document.getElementById("username_input").style.display = "none"
    document.getElementById("onlineGamesTable").style.display = "block";
    addOnlineGames();
}

function grayPic1(should) {
    if (should) {
        document.getElementById("pic1").style.filter = "grayscale(100)";
        document.getElementById("pic2").style.filter = "grayscale(0)";
    } else {
        document.getElementById("pic1").style.filter = "grayscale(0)";
        document.getElementById("pic2").style.filter = "grayscale(100)";
    }
}

function addOnlineGameRow(game) {
    var gameList = document.getElementById("onlineGames-rows");
    var joinGameIcon;
    var row = document.createElement("tr");
    row.className = "element";
    let host = game[0];
    let playersInGame = game[1];
    var gameID = game[2];
    var board = game[3];
    var creationDate = parseInt(game[4]);
    var gameLength = parseInt(game[5]);
    var gameStartTime = parseInt(game[6]);
    var toShow = [host, playersInGame];

    // check if game startTime has passed
    if (gameStartTime && gameStartTime < Date.now())
        return;

    // Game creation only valid for 20 minutes
    var twentyMinutes = 20 * 60 * 1000;
    var timeoutTime = creationDate + twentyMinutes;
    if (timeoutTime < Date.now())
        return;

    toShow.forEach((elem) => {
        var entry = document.createElement("td");
        entry.innerText = elem;
        entry.className = "font"
        row.appendChild(entry)
    });
    joinGameIcon = document.createElement("i");
    joinGameIcon.id = "joinGame_host_" + host;
    joinGameIcon.className = "fa fa-square-o joinCheck";
    joinGameIcon.onclick = () => {
        handleOnlineGameJoin(joinGameIcon, gameID);
    }

    row.appendChild(joinGameIcon);

    gameList.appendChild(row);
    return joinGameIcon;
}

function createNewGame() {
    var numPlayers = 1;
    var gameID = startChannel();
    document.board = shuffledBoard();
    var now = Date.now();
    var arr = [document.username, numPlayers, gameID,
    JSON.stringify(document.board), now,document.setupTime];
    let values = [arr];

    document.isHost = true;

    var range = 'OnlineGames!A:E';
    postToGoogleSheets(values, range);

    joinChannel();
}

function handleOnlineGameJoin(joinGameIcon, gameID) {
    // remove checkmark
    // var rows = document.getElementById("onlineGames-rows").children;
    // for (var i = 0; i < rows.length; i++) {
    //     rows[i].children[2].className = "fa fa-square-o joinCheck";
    //     console.log();
    // }

    // document.channel = gameID;
    joinHost(gameID);
    // joinGameIcon.className = "fa fa-check-square joinCheck";
}

function joinMultiplayer(event, obj) {
    if (event.key === "Enter") {
        var channel = obj.value;
        if (channel != "") {
            document.channel = channel;
            changeSetupState(SetupStates.waitingForStart);
        }
    }
}

function usernameEntered(event, obj) {
    if (event.key === "Enter") {
        var username = obj.value;
        if (username != "") {
            document.username = username;
            submitUsername();
        }
    }
}

function startMultiGame() {
    document.isSinglePlayerGame = false;
    var msg = {
        "board": document.board,
        "time": document.setupTime,
        "numPlayers": document.otherPlayers.size + 1
    }
    sendMessage(msg, MessageType.initialBoards);
}

function changeTimeMulti(change) {
    var time = document.setupTime / 60000;
    var minTime = 1;

    time += change;
    if (time > minTime) time = Math.min(10, time);
    else time = minTime;

    setClock(time, 0, "clockdiv_setup_multi");

    document.setupTime = time * 60000;
}

function exitMultiplayerSession() {
    document.getElementById("join_id").value = document.channel;
    removePlayer(document.me);
    unsubscribe();

    changeSetupState(SetupStates.enterGameId);
}

function mainMenu_setupMulti() {
    // Go to main menu
    mainMenu();
}