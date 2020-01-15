function copyArr(arr){
	return JSON.parse(JSON.stringify(arr));
}

function adjustCoordinates(coords,rot){
	var currRot = document.currRotation;
	if(rot) currRot = rot;
	switch(currRot){
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

function eraseCookieFromAllPaths(name) {
    // This function will attempt to remove a cookie from all paths.
    var pathBits = location.pathname.split('/');
    var pathCurrent = ' path=';

    // do a simple pathless delete first.
    document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;';

    for (var i = 0; i < pathBits.length; i++) {
        pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[i];
        document.cookie = name + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;' + pathCurrent + ';';
    }
}

function addFieldToCookie(key,value){
	document.cookie
	console.log(document.cookie)
    var dict = {};
    // if(document.cookie){
    // 	dict = JSON.parse(document.cookie);
    // 	dict[key] = value;
    // }
    document.cookie = key+"="+value;

    // document.cookie = JSON.stringify(dict);
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};