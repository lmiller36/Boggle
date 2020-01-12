function mainMenu() {
    // Go to main menu
    setHashString(Pages.mainMenu);
}

function singlePlayer(){
	document.setupTime = 5 * 60000;
	setHashString(Pages.setupSinglePlayer);
}

function multiplayer(){
	document.setupTime = 5 * 60000;
	document.endGame = false;
	setHashString(Pages.setupMulti);
}

function highscores(){
	readFromGoogleSheets((response)=>{
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
	
	setHashString(Pages.highScores);
}

function game(isMulti){
	if(!document.board)
		document.board = shuffledBoard();
	setupGame(isMulti);
	setHashString(Pages.game);
}

function transition(){
	var hashString = window.location.hash;
	var page;
	// read hashstring to get page
	if(hashString){
		var elements = hashString.split("/");
		page = elements[1];	
	}
	else 
		page = Pages.mainMenu; 

	if(page != Pages.game){
		removeGameElements();
	}

	// toggle page to be showed
	toggleVisiblePage(page);
}

/** 
 * Shows all elements corresponding to given page, hides others 
 * Appends page to query string
 **/
 function toggleVisiblePage(visiblePage) {
 	var loadPage = () => {
 		Object.keys(Pages).forEach((page) => {
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
        });
 	};

 	ensureAllPagesLoaded(loadPage);
 }

 function setHashString(page){
 	if(page == Pages.mainMenu){
 		window.location.hash = "";
 	}
 	else {
 		window.location.hash = "#/"+page;
 	}
 }

 function removeGameElements(){
    // Stop timer & set to zeros
    togglePause(false);
    clearInterval(document.timeinterval);
    document.remaining = null;

    // Remove words
    removeWords();

    // Remove Tiles
    removeBoardTiles();

    clearInterval(document.timeinterval);
    document.timeinterval = null;
}