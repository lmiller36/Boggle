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

    // check if a game is joinable
    $(document.me && document.googleLoggedIn).ready(function() {
        var queryString = window.location.hash.substr(1);
        // join game
        if (queryString.startsWith("setupMulti/joinGame/")) {
            var channelID = queryString.substring(queryString.lastIndexOf("/") + 1);
            document.channel = channelID;
            document.isHost = false;
            ensureAllPagesLoaded(() => {
                linkGame();
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
 ensureAllPagesLoaded(() => {
        //load custom pages
        load("./data/pacman.html","pacman_container","#pacman",'#waitingPacmanContainer')
        load("./data/spinner.html","spinner_container","#spinner",'#waitingSpinnerContainer')

        //load cached username
        var cookieFields = document.cookie.split(" ");
        cookieFields.forEach((field)=>{
            if(field.indexOf("username=") != -1){
                document.username = field.split("=")[1];
            }
        })

    });
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

window.addEventListener('hashchange',() => {
 transition();
})

function checkFirstVisit(){
    if(document.cookie.indexOf('mycookie') == -1){
        document.cookie = 'mycookie=1';
        // addFieldToCookie("mycookie",1)
    }
    else 
    {
        // when refreshed go to main menu
        // TODO: dont always do this
        mainMenu();
    }
}

function load(htmlUrl,divContainer,elementName,toMove){
    fetch(htmlUrl)
    .then(response => {
        return response.text()
    })
    .then(data => {

     document.getElementById(divContainer).innerHTML = data;
     var element = $(elementName).detach();
     $(toMove).append(element);
 });
}