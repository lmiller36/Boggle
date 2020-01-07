// Main Menu UI Functions

Set.prototype.difference = function(otherSet) 
{ 
	// creating new set to store difference 
	var differenceSet = new Set(); 

	// iterate over the values 
	for(var elem of this) 
	{ 
	    // if the value[i] is not present  
	    // in otherSet add to the differenceSet 
	    if(!otherSet.has(elem)) 
	    	differenceSet.add(elem); 
	} 

	// returns values of differenceSet 
	return differenceSet; 
}

function setupSinglePlayer(){
	document.board = shuffledBoard();
	document.setupTime = 5 * 60000;
	toggleVisiblePage(Pages.setupSinglePlayer);
}

function multiplayer(){
	document.setupTime = 5 * 60000;
	// document.getElementById("host").style.display = "none";
	// document.getElementById("join").style.display = "none";

	document.getElementById("startGameMultiButton").style.display = "none";
	document.getElementById("pacman_container").style.display = "none";
	toggleVisiblePage(Pages.setupMulti);
	changeSetupState(SetupStates.radioButton);
}


function loadHighScores(){

	readFromGoogleSheets('Highscores!A1:F',(response)=>{
		console.log(response)
		let values = response.result.values;

		console.log(values);

		if(!values) return;

		var header = values.splice(0,1)[0];
		var sortedScores = values.sort(function(a, b){
			return parseInt(parseInt(b[0] - a[0]));
		});

		let count = 1;

		var scoreEntries = "highscores-rows";
		removeNode(scoreEntries);
		var scoresList = document.getElementById(scoreEntries);
		sortedScores.forEach( (entry) => {
			let score = entry[0];
			let username = entry[1];
			let timeOfPlay = entry[2];
			let avatarUrl = entry[3];
			let board = JSON.parse(entry[4]);
			let words = JSON.parse(entry[5]);

			console.log(words.length);

			var bestWord = "";
			if(words.length == 1) bestWord = words[0];
			else {
				words.forEach((word)=>{
					if(word.length > bestWord) bestWord = word;
				})
			}

			let date = new Date(parseInt(timeOfPlay)).toLocaleDateString("en-US");
			let toShow = [count,username,"avatar",score,date,bestWord.toUpperCase()];

			var row = document.createElement("tr");
			row.className = "element";

			var children = [];

			toShow.forEach((row)=>{
				var entry = document.createElement("td");
				entry.innerText = row;
				entry.className = "font"
				children.push(entry);
			});

			var avatar = document.createElement("img");
			avatar.className = "avatar";
			avatar.src = avatarUrl;

			var avatarDiv = children[2];
			avatarDiv.innerText = "";
			avatarDiv.appendChild(avatar);

			children.forEach((child)=> row.appendChild(child));

			scoresList.appendChild(row);

			count ++;
		})
	})
	
	toggleVisiblePage(Pages.highScores);

}
function openContributions(){
	var words1 = ["hey","hi","yp"];
	var words2 = ["hey","hi","yp","hello","great","words"];
	var words3 = ["hey","hi","yp","today"];

	var set1,set2,set3;
	set1 = new Set(words1);
	set2 = new Set(words2);
	set3 = new Set(words3);

	var sets = [set1,set2,set3];

	let unique1 = set1.difference(set2).difference(set3);
	let unique2 = set2.difference(set1).difference(set3);
	let unique3 = set3.difference(set1).difference(set2);

	var scores = [0,0,0];

	var numOpponents = 3;
	var allWords = [words1,words2,words3];

	var maxLength = Math.max(words1.length,words2.length,words3.length);
	console.log(maxLength);

	var opponentsWords = document.getElementById("opponentsWords-rows");

	var unique = [];

	for(var i = 0;i < numOpponents;i++){
		var currUnique = new Set(sets[i]);
		console.log(currUnique);
		for(var j = 0;j < numOpponents;j++){
			if(i != j){
				currUnique = currUnique.difference(sets[j]);
			}
		}
		unique.push(currUnique);
	}

	console.log(unique);

	for(var i = 0; i < maxLength;i++){
		var row = document.createElement("tr");
		row.className = "element";

		for(var j = 0;j < numOpponents;j++){

			var entry = document.createElement("td");
			var word = "";
			if(i < allWords[j].length){
				word = allWords[j][i];
				 // is not unique
				 if(!unique[j].has(word)){
				 	entry.style.textDecoration = "line-through"
				 }
				 else{
				 	scores[j] += getScore(word);
				 }
				}
				entry.innerText = word.toUpperCase();
				entry.className = "font";
				row.appendChild(entry);
			}

			opponentsWords.appendChild(row);
		}

		console.log(scores);

		// add scores
		var score_row = document.createElement("tr");
		score_row.className = "element";

		scores.forEach((score)=>{
			console.log(score);
			var entry = document.createElement("td");
			entry.innerText = score;
			entry.className = "font"
			entry.style.textAlign = "center";

			score_row.appendChild(entry);
		});

		opponentsWords.appendChild(score_row);

		toggleVisiblePage(Pages.contributions);
	}