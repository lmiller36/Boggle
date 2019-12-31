// setupMulti UI Functions
const SetupStates = Object.freeze({
    "radioButton": "radioButton",
    "submitUsername": "submitUsername",
    "enterGameId": "enterGameId",
    "waitingForStart": "waitingForStart"
});

function changeSetupState(setupState) {

    document.getElementById("host").style.display = "none";
    document.getElementById("game_link").innerText = "";
    document.getElementById("startGameMultiButton").style.display = "none";
    document.getElementById("pls_start").style.display = "none";
    document.getElementById("join_id").style.display = "none";
    document.getElementById("game_id").style.display = "none";
    document.getElementById("game_id").innerText = "";
    if(document.getElementById("pacman"))   
        document.getElementById("pacman").style.display = "none";
    document.getElementById("hasJoined_container").style.display = "none";
    document.getElementById("hostJoinRadio").style.display = "none";

    if (document.channel) {
        document.getElementById("game_id").innerText = document.channel;
        document.getElementById("game_id").style.display = "";
    }

    if (document.username) {

        document.getElementById("username_container").style.display = "none";
        document.getElementById("username_submitted").style.display = "";
        document.getElementById("username_submitted_span").innerText = "Username: " + document.username;
    } else {
        document.getElementById("username_submitted").style.display = "none";
        document.getElementById("username_container").style.display = "none";
    }


    if (setupState == SetupStates.radioButton) {
        document.getElementById("hostJoinRadio").style.display = "";
    } else if (setupState == SetupStates.submitUsername) {
        document.getElementById("username_container").style.display = "";

    } else if (setupState == SetupStates.enterGameId) {
        document.getElementById("join_id").style.display = "";
    } else if (setupState == SetupStates.waitingForStart) {
        joinChannel();
        if (document.isHost) {
            document.getElementById("host").style.display = "";
            document.getElementById("game_link").innerText = document.joinUrl;
            document.getElementById("startGameMultiButton").style.display = "";
        } else {
            document.getElementById("hasJoined_container").style.display = "";
            document.getElementById("hasJoined").innerText = "Joined: " + document.channel;
            if(document.getElementById("pacman"))   
                document.getElementById("pacman").style.display = "block";
        }
    } else {
        alert('invalid state');
    }
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
            usernameDone();
        }
    }
}

function usernameDone() {
    console.log("done: " + document.isHost);
    if (!document.isHost) {
        if (!document.channel)
            changeSetupState(SetupStates.enterGameId);
        else {
            changeSetupState(SetupStates.waitingForStart);
        }
    } else {
        changeSetupState(SetupStates.waitingForStart);
    }
}

function startMultiGame() {
    document.getElementById("pacman").style.display = "none";

    document.isSinglePlayerGame = false;
    var msg = {
        "board": document.board,
        "time": document.setupTime,
        "numPlayers": document.otherPlayers.size + 1
    }
    console.log("start");
    sendMessage(msg, MessageType.initialBoards);
}

function changeTimeMulti(change) {
    var time = document.setupTime / 60000;

    time += change;
    if (time > 5) time = Math.min(10, time);
    else time = 5;

    setClock(time, 0, "clockdiv_setup_multi");

    document.setupTime = time * 60000;
}

function toggleHost(isHost) {
    console.log("toggle: " + isHost);
    document.isHost = isHost;

    document.board = null;

    if (document.isHost) {

        // unsubscribe to old seed
        if (document.channel != null) {
            unsubscribe(document.channel);
        }

        var seed = startChannel();
        document.board = shuffledBoard();
        document.channel = seed;
        var url = "lmiller36.github.io/Boggle/#/joinGame/" + seed;
        console.log(url);
        document.joinUrl = url;
    }

    if (document.username) {
        usernameDone();
    } else {
        changeSetupState(SetupStates.submitUsername);
    }
}

function exitMultiplayerSession() {
    document.getElementById("join_id").value = document.channel;
    removePlayer(document.me);
    unsubscribe();

    changeSetupState(SetupStates.enterGameId);
}

function mainMenu_setupMulti() {
    document.getElementById("pacman").style.display = "none";

    unsubscribe();

    //TODO Unsubscribe stuff
    // Go to main menu
    toggleVisiblePage(Pages.mainMenu);
}