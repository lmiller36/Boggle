var pubnub;
var channel;
var isHost = false;

$(document).ready(function() {
	pubnub = new PubNub({
		publishKey: 'pub-c-10d297a3-4a59-41b5-8770-9a3cc3625270',
		subscribeKey: 'sub-c-68069aa6-269d-11ea-95be-f6a3bb2caa12'
	});
	// document.pubnub = new PubNub({
	// 	publishKey: 'pub-c-10d297a3-4a59-41b5-8770-9a3cc3625270',
	// 	subscribeKey: 'sub-c-68069aa6-269d-11ea-95be-f6a3bb2caa12'
	// });

});

function startChannel(){
	var alphanumeric = randomAlphanumeric();

	joinChannel(alphanumeric, true);

	return alphanumeric;
}

function joinChannel(channelID, shouldBeHost){
	if(shouldBeHost) isHost = true;
	pubnub.subscribe({
		channels: [channelID]
	});

		// Subscribe to the demo_tutorial channel
		pubnub.addListener({
			message: function(message) {
				receiveMessage(message)
			}
		});

		channel = channelID;
	}

	function receiveMessage(message){
		message = message.message;
		if(message.type == MessageType.initialBoards){
			document.board = message.message.board;
			document.setupTime = message.message.time;
			startGame();
		// if(isHost){

		// }
	}
	else if (message.type == MessageType.endGame){
		if(message.message.sender != document.me){
			var opponentsWords = message.message.words;

			var newArr = [];
			var score = 0;

			document.uniqueWords.forEach((word)=>{
				// not unique
				if(opponentsWords.indexOf(word) != -1){
					console.log(word);
					console.log("word_"+word);
					console.log(document.getElementById("word_"+word.toUpperCase()))
					document.getElementById("word_"+word.toUpperCase()).style.textDecoration = "line-through";
				}
				else
				{
					newArr.push(word);
					score += getScore(word);
				}
			});

			document.uniqueWords = newArr;
			document.score = score;

			alert("Your score is "+score);
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