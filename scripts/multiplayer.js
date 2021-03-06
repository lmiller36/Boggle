var pubnub;
var isHost = false;

$(document).ready(function() {
    document.me = randomAlphanumeric();
    pubnub = new PubNub({
        publishKey: 'pub-c-10d297a3-4a59-41b5-8770-9a3cc3625270',
        subscribeKey: 'sub-c-68069aa6-269d-11ea-95be-f6a3bb2caa12'
    });
    pubnub.addListener({
        message: function(message) {
            receiveMessage(message)
        }
    });
});

function startChannel() {
    var alphanumeric = randomAlphanumeric();
    document.otherPlayers = new Set();
    document.channel = alphanumeric;

    return alphanumeric;
}

function joinChannel(channel) {
    if(channel)
        document.channel = channel;

    document.hostAckedJoin = false;
    if (!document.hasJoined) {
        console.log("joined:" + document.channel);
        document.joinedPlayers = 0;

        pubnub.subscribe({
            channels: [document.channel]
        });

        // Tell host that we've joined
        if (!document.isHost) {
            var ackMsg = {
                "sender": document.me,
                "username": document.username
            }
            sendMessage(ackMsg, MessageType.joinGame);
        }
        document.hasJoined = true;
    }
}

// Tell a player that host has added them into game
function ackPlayer(playerId){
        var ackPlayerMsg = {
        "ackedPlayer": playerId
    }

    sendMessage(ackPlayerMsg, MessageType.ackJoin);
}

function removePlayer(playerId) {
    var bootMsg = {
        "unsubscribedId": playerId
    }

    sendMessage(bootMsg, MessageType.unsubscribe);
}

function bootPlayer(playerId) {
    var bootMsg = {
        "bootedId": playerId
    }

    document.otherPlayers.delete(playerId);

    sendMessage(bootMsg, MessageType.booted);
}

function unsubscribe() {
    // only leave channel if currently joined
    console.log("left:" + document.channel);

    if(document.channel){
        document.hasJoined = false;

        pubnub.unsubscribe({
            channels: [document.channel]
        });
    }
    document.channel = null;
}

function receiveMessage(message) {
    message = message.message;
    console.log(message);
    if (message.type == MessageType.joinGame) {
        if (document.isHost) {
            // check if player has been added previously
            if(document.otherPlayers.has(message.message.sender))
                return;
            
            document.otherPlayers.add(message.message.sender);
            appendPlayerToTable(message.message.sender, message.message.username);
            ackPlayer(message.message.sender);
        }

    } else if (message.type == MessageType.ackJoin) {
        var ackedPlayer = message.message.ackedPlayer;

        // Entered Game
        if(!document.isHost && ackedPlayer == document.me){
            document.hostAckedJoin = true;
        }
    }
    else if (message.type == MessageType.booted) {
        var bootedId = message.message.bootedId;

        console.log(message);
        // Oh no! I've been booted
        if (bootedId == document.me) {
            alert("You have been booted by the host");
            bootMe();
        }
    } else if (message.type == MessageType.unsubscribe) {
        var unsubscribedId = message.message.unsubscribedId;
        if (document.isHost) {
            console.log("delete " + unsubscribedId);
            document.otherPlayers.delete(unsubscribedId);

            var id = "id_" + unsubscribedId;
            jquerydelete(id);
        }
    } else if (message.type == MessageType.initialBoards) {
        document.board = message.message.board;
        document.setupTime = message.message.time;
        document.numPlayers = message.message.numPlayers;
        game(true);
    } else if (message.type == MessageType.endGame) {
        if (message.message.sender != document.me) {
            if (!document.allWords) document.allWords = [];
            var opponentsWords = message.message.words;
            document.allWords.push({
                "sender": message.message.sender,
                "username": message.message.username,
                "words": opponentsWords
            });

            if (document.allWords.length == document.numPlayers) {
                console.log(document.allWords);
                tallyScores();
            }
        }
    }
    else {
        console.log("INVALID MESSAGE");
    }
}

function sendMessage(msg, msgType) {
    pubnub.publish({
        message: {
            "message": msg,
            "type": msgType
        },
        channel: document.channel
    });
}