// setupMulti UI Functions
const SetupStates = Object.freeze({
    "radioButton": "radioButton",
    "submitUsername": "submitUsername",
    "enterGameId": "enterGameId",
    "waitingForStart": "waitingForStart"
});

function grayPic1(should){
    if(should){
        document.getElementById("pic1").style.filter = "grayscale(100)";
        document.getElementById("pic2").style.filter = "grayscale(0)";
    }
    else {
        document.getElementById("pic1").style.filter = "grayscale(0)";
        document.getElementById("pic2").style.filter = "grayscale(100)";
    }
}

function linkGame(){
    document.getElementById("viaLink").style.display = "";
    document.getElementById("onlineGame").style.display = "none";

    grayPic1(false);
}

function onlineGame(){  
    document.getElementById("viaLink").style.display = "none";
    document.getElementById("onlineGame").style.display = "";

    grayPic1(true);
    removeAllChildren("onlineGames-rows");
    readFromGoogleSheets('OnlineGames!A2:E',(response)=>{
        var games = response.result.values;
        var users = {};
        console.log(response);
        // get most recent game
        games.forEach((game)=>{
            var user = game[0];
            if(!users[user]) users[user] = game;
            else {
                   users[user] = game; 
           }
       });

        Object.values(users).forEach((game)=>{
            var user = game[0];
            addOnlineGameRow(game);

        })
        console.log(response);
    })
}

function addOnlineGameRow(game){
    var gameList = document.getElementById("onlineGames-rows");
    var joinGameIcon;
    var row = document.createElement("tr");
    row.className = "element";
    let host = game[0];
    let playersInGame = game[1];
    var gameID = game[2];
    var toShow = [host,playersInGame];

    toShow.forEach((elem)=>{
        var entry = document.createElement("td");
        entry.innerText = elem;
        entry.className = "font"
        row.appendChild(entry)
    });
    joinGameIcon = document.createElement("i");
    joinGameIcon.id = "joinGame_host_"+host;
    joinGameIcon.className = "fa fa-square-o joinCheck";
    joinGameIcon.onclick = () =>{
       handleOnlineGameJoin(joinGameIcon,gameID);
   }

   row.appendChild(joinGameIcon);

   gameList.appendChild(row);
   return joinGameIcon;
}

function createNewGame(){
    var numPlayers = 1;
    var gameID = startChannel();
    document.board = shuffledBoard();
    var now = Date.now();
    var arr = [document.username, numPlayers, gameID, JSON.stringify(document.board),now];
    let values = [arr];

    
    document.isHost = true;

    var joinGameIcon = addOnlineGameRow(arr);
    handleOnlineGameJoin(joinGameIcon,gameID);

    var range = 'OnlineGames!A:E';
    postToGoogleSheets(values,range);
}

function handleOnlineGameJoin(joinGameIcon,gameID){
   // remove checkmark
   var rows = document.getElementById("onlineGames-rows").children;
   for(var i = 0;i < rows.length;i++){
    rows[i].children[2].className = "fa fa-square-o joinCheck";
    console.log();
}

document.getElementById("viaLink").style.display = "";
document.channel = gameID;
joinGameIcon.className = "fa fa-check-square joinCheck";
if (document.username) {
    usernameDone();
} else {
    changeSetupState(SetupStates.submitUsername);
}

}

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
        if(document.getElementById("pacman"))   
            document.getElementById("pacman").style.display = "block";
        if (document.isHost) {
            document.getElementById("host").style.display = "";
            document.getElementById("game_link").innerText = document.joinUrl;
            document.getElementById("startGameMultiButton").style.display = "";
        } else {
            document.getElementById("hasJoined_container").style.display = "";
            document.getElementById("hasJoined").innerText = "Joined: " + document.channel;
            // if(document.getElementById("pacman"))   
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
    if(document.getElementById("pacman"))  
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
        var url = "lmiller36.github.io/Boggle/#/setupMulti/joinGame/" + seed;
        console.log(url);
        document.joinUrl = url;
    }

    if (document.username) {
        changeSetupState(SetupStates.waitingForStart);

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
    // Go to main menu
    mainMenu();
}