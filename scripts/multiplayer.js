var pubnub;
var channel;
var isHost = false;

$(document).ready(function() {
	pubnub = new PubNub({
		publishKey: 'pub-c-10d297a3-4a59-41b5-8770-9a3cc3625270',
		subscribeKey: 'sub-c-68069aa6-269d-11ea-95be-f6a3bb2caa12'
	});
	document.me = randomAlphanumeric();
});

function startChannel(){
	var alphanumeric = randomAlphanumeric();
	document.otherPlayers = new Set();
	joinChannel(alphanumeric, true);

	return alphanumeric;
}

function joinChannel(channelID, shouldBeHost){
	console.log(channelID)
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

function removePlayer(playerId){
	var bootMsg = {
		"unsubscribedId" : playerId
	}

	sendMessage(bootMsg,MessageType.unsubscribe);
}

function bootPlayer(playerId){
	var bootMsg = {
		"bootedId" : playerId
	}

	document.otherPlayers.delete(playerId);

	sendMessage(bootMsg,MessageType.booted);
}

function unsubscribe(){
	pubnub.unsubscribe({
		channels: [channel]
	});
}

function receiveMessage(message){
	message = message.message;
	console.log(message);
	if(message.type == MessageType.joinGame){
		if(isHost){
			document.otherPlayers.add(message.message.sender);
			appendPlayerToTable(message.message.sender);
		}

	}
	else if (message.type == MessageType.booted){
		var bootedId = message.message.bootedId;

		console.log(message);
			// Oh no! I've been booted
			if(bootedId == document.me){
				alert("You have been booted by the host");
				bootMe();
			}
		}
		else if (message.type == MessageType.unsubscribe){
			var unsubscribedId = message.message.unsubscribedId;
			if(isHost){
				document.otherPlayers.delete(unsubscribedId);

				var id = "id_"+unsubscribedId;
				jquerydelete(id);
			}
		}
		else if(message.type == MessageType.initialBoards){
			document.board = message.message.board;
			document.setupTime = message.message.time;
			document.numPlayers = message.message.numPlayers;
			startGame(true);
		}
		else if (message.type == MessageType.endGame){
			if(message.message.sender != document.me){
				var opponentsWords = message.message.words;
				console.log(opponentsWords);
				console.log(document.uniqueWords);	

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
				document.uniqueWords = newArr;

				if(document.numPlayers == 0){
					
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