function removeBoardTiles(){
	// remove each rotation
	for(var i = 0;i < 4;i++){
		var id = "board-"+i;
		var node = document.getElementById(id);
		var cNode = node.cloneNode(false);
		node.parentNode.replaceChild(cNode, node);
	}
}
function shuffledBoard(){
	// copy dice
	var newBoardDice = JSON.parse(JSON.stringify(document.tiles));
	// shuffle dice
	newBoardDice.sort(function() {
		return .5 - Math.random();
	});

	// iterate over dice and choose a random letter from each
	var board = [];
	var arr ;
	for(var i = 0; i < newBoardDice.length;i++){
		var str = newBoardDice[i];
		if(i % 5 == 0) arr = [];
		var index = Math.floor(Math.random() * str.length);
		var letter = str.substring(index,index+1);
		//Q => QU
		if(letter == "Q") letter = "QU";
		arr.push(letter.toUpperCase());
		if((i+1) % 5 == 0) board.push(arr);
	}
	
	return board;
}
function rotateBoard(direction){
			//hide current rotation
			var currRotation = "board-"+document.currRotation;
			document.getElementById(currRotation).style.display = "none";
			//advance
			currRotation = (document.currRotation + direction) % 4;
			if(currRotation == -1) currRotation = 3;

			//show next rotation
			var nextRotation = "board-"+currRotation;
			document.getElementById(nextRotation).style.display = "grid";

			//save
			document.currRotation = currRotation;

			//fix highlighting
			if(document.lastHighlighted)
				highlightBoard(document.lastHighlighted);

		}	
		function highlightBoard(lettersToHighlight){
			removeHighlightingFromAll();

			lettersToHighlight.forEach((coords)=>{
				coords = adjustCoordinates(coords);
				highlightLetter(coords[0],coords[1]);
			});
		}
		function removeHighlightingFromAll(){
			for(var rot = 0; rot < 4;rot++){
				for(var i = 0;i<5;i++){
					for(var j = 0;j<5;j++){
						var id = "row_"+i+"_column_"+j+"_"+rot;
						var div = document.getElementById(id);
						if(div){
							div.style.border = "1px solid rgba(0, 0, 0, 0.8)";
							div.style.background = "rgba(255, 255, 255, 0.8)";
						}
					}
				}
			}
		}
		function highlightLetter(row,col){
			var id = "row_"+row+"_column_"+col+"_"+document.currRotation;
			var div = document.getElementById(id);
			div.style.border = "white 1px solid";
			div.style.background = "white";
		}
		
		function removeWords(){
			var id = "wordList";
			var node = document.getElementById(id);
			var cNode = node.cloneNode(false);
			node.parentNode.replaceChild(cNode, node);
		}