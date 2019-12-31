// load pages
$(document).ready(function() {
    Object.keys(Pages).forEach((page) => {
        var htmlUrl = "./pages/" + page + "/" + page + ".html";
        var divContainer = page + "_container";
        var scriptId = "./pages/" + page + "/" + page + ".js";
        fetch(htmlUrl)
        .then(response => {
            return response.text()
        })
        .then(data => {
            document.getElementById(divContainer).innerHTML = data;
            document.page = true;
        });

        var script = document.createElement('script');
        script.src = scriptId;

        document.head.appendChild(script);
    });

    // function pubnubStartup(){

    // check if a game is joinable
    $(document.me && document.googleLoggedIn).ready(function() {
        console.log(document.me);
        var queryString = window.location.hash.substr(1);
        // join game
        if (queryString.startsWith("/joinGame/")) {

            var channelID = queryString.substring(queryString.lastIndexOf("/") + 1);
            document.channel = channelID;
            document.isHost = false;
            ensureAllPagesLoaded(() => {
                toggleVisiblePage(Pages.setupMulti);
                changeSetupState(SetupStates.submitUsername)
            });
        }
    });
});




// load data
$.ajax({
    url: "data/tiles.txt",
    dataType: "JSON",
    success: function(data) {
        document.tiles = data;
    }
});

$(document).ready(function() {
    // load pacman
    var pacmanlink = document.getElementById('pacman_import');
    var content = pacmanlink.import;

    if(content){
        var el = content.querySelector('.pacman_svg');
        document.getElementById("pacman_container").appendChild(el.cloneNode(true));
    }
});

document.wordlist = [];
[10, 20, 35, 40, 50, 55, 60, 70].forEach(function(frequency) {
    var url = "data/words/english-words-" + frequency + ".json";
    $.ajax({
        url: url,
        dataType: "JSON",
        success: function(data) {
            document.wordlist = document.wordlist.concat(data);
        }
    });

});