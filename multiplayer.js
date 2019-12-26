var pubnub;
var channel;
var isHost = false;

$(document).ready(function() {
	pubnub = new PubNub({
		publishKey: 'pub-c-10d297a3-4a59-41b5-8770-9a3cc3625270',
		subscribeKey: 'sub-c-68069aa6-269d-11ea-95be-f6a3bb2caa12'
	});
});

function startChannel(){
	var alphanumeric = randomAlphanumeric();
	document.numPlayers = 1;
	joinChannel(alphanumeric, true);

	return alphanumeric;
}

function joinChannel(channelID, shouldBeHost){
	document.me = randomAlphanumeric();
	document.joinedPlayers = 0;

	if(shouldBeHost) isHost = true;
	pubnub.subscribe({
		channels: [channelID]
	});

	pubnub.addListener({
		message: function(message) {
			receiveMessage(message)
		}
	});

	channel = channelID;

	// Tell host that we've joined
	if(!isHost){
		var ackMsg = {
			"sender" : document.me
		}
		sendMessage(ackMsg,MessageType.joinGame);
	}
}

	function bootPlayer(playerId){
		var bootMsg = {
			"booted" : playerId
		}

		document.numPlayers --;

		sendMessage(bootMsg,MessageType.booted);
	}

	function unsubscribe(){
		pubnub.unsubscribe({
			channels: [channel]
		});
	}

	function receiveMessage(message){
		message = message.message;
		if(message.type == MessageType.joinGame){
			if(isHost){
				document.numPlayers += 1;
				appendPlayerToTable(message.message.sender);
			}

		}
		else if (message.type == MessageType.booted){
			var bootedId = message.message.booted;

			// Oh no! I've been booted
			if(bootedId == document.me){
				alert("You have been booted by the host");
				exitMultiplayerSession();
			}
		}
		else if(message.type == MessageType.initialBoards){
			document.board = message.message.board;
			document.setupTime = message.message.time;
			document.numPlayers = message.message.numPlayers;
			startGame();
		}
		else if (message.type == MessageType.endGame){
			console.log(message.message.words);
			if(message.message.sender != document.me){
				var opponentsWords = message.message.words;

				var newArr = [];
				var score = 0;

				document.uniqueWords.forEach((word)=>{
					// not unique
					if(opponentsWords.indexOf(word) != -1){
						document.getElementById("word_"+word.toUpperCase()).style.textDecoration = "line-through";
					}
					else
					{
						newArr.push(word);
						score += getScore(word);
					}
				});

				document.numPlayers --;

				if(document.numPlayers == 1){
					document.uniqueWords = newArr;
					document.score = score;

					document.getElementById("score").innerText = score;

					alert("Your score is "+score);
				}
			}
		}
	}

	function sendMessage(msg,msgType){
		pubnub.publish({
			message: {
				"message":msg,
				"type":msgType
			},
			channel: channel
		});
	}