	function copyArr(arr){
		return JSON.parse(JSON.stringify(arr));
	}

	function adjustCoordinates(coords){
		switch(document.currRotation){
			case 0:
			return coords;
			case 3:
			return [coords[1],4 - coords[0]]
			case 2:
			return [4 - coords[0], 4 - coords[1]];
			case 1:
			return [4 - coords[1],coords[0]];
		}
	}

	function getScore(word){
		if(word.length == 4) return 1
			if(word.length == 5) return 2;
		if(word.length == 6) return 3;
		if(word.length == 7) return 5;
		if(word.length >= 8 )return 11;

		return -1;
	}

	function randomAlphanumeric(){
		return Math.random().toString(36).slice(2).toUpperCase();
	}

	function removeNode(nodeId){
		var node = document.getElementById(nodeId);
		console.log(node);
		var cNode = node.cloneNode(false);
		node.parentNode.replaceChild(cNode, node);
	}

	function jquerydelete(nodeId){
		$("#"+nodeId).remove();
	}

	function removeAllChildren(nodeId){
		var e = document.getElementById(nodeId);
		var child = e.lastElementChild;  
		while (child) { 
			e.removeChild(child); 
			child = e.lastElementChild; 
		} 
	}