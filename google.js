var SHEET_ID = '1vP3OHMLITjfMsmh7ICFDqqtrP1mmHVZjMkQ_2kMPVDk';
var CLIENT_ID = '968840994510-d1gefhobjq4be9ofad0v81ek2qlmdo8u.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAwb096dzp9ykl-v46KBA0ZPGF8OoAV_pE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function updateSigninStatus(isSignedIn) {
    console.log(isSignedIn)
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
        cookie_policy: "single_host_origin"
    }).then(function(res) {
        console.log(res);

        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        console.log(document.cookie);

    }, function(error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    document.username = profile.getEmail().substring(0, profile.getEmail().indexOf("@"));
    document.avatar = profile.getImageUrl();

    let image_url = profile.getImageUrl();
    if (image_url) {
        document.getElementById("google-sign-in").style.display = "none";
        document.getElementById("google-user-image-url").style.display = "block";
        document.getElementById("google-user-image-url").src = image_url;

    }
    document.googleLoggedIn = true;
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        console.log('User signed out.');
    });

    if (document.username)
        document.getElementById("username_container").style.display = "none";

    document.getElementById("google-sign-in").style.display = "block";
    document.getElementById("google-user-image-url").style.display = "none";
    document.getElementById("google-user-image-url").removeAttribute('src');

    document.username = null;
    document.avatar = null;
    document.googleLoggedIn = false;
}

function postFakeWords(words){
    console.log(words);
    console.log(document.username);

    // check if signed in
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) return;
    

    let date = new Date();
    let timeInUTC = date.getTime();
    var username = document.username;

    let values = [
    [JSON.stringify(words),username,date,timeInUTC]
    ];

    console.log(values);

     var range = 'FakeWords!A:D';

    postToGoogleSheets(values,range);
}

function postHighScore(score, board, words) {

    var username = "anonymous";

    let timeInUTC = new Date(Date.now()).getTime();
    var avatar = "https://ssl.gstatic.com/docs/common/profile/badger_lg.png";

    //user is signed in
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        username = document.username;
        avatar = document.avatar;
    } else {
        console.log("score was not submitted");
        return;
    }

    let values = [
        [score, username, timeInUTC, avatar,
        JSON.stringify(board), JSON.stringify(words)]
    ];

    var range = 'Highscores!A:F';

    postToGoogleSheets(values,range);
}

function postToGoogleSheets(values,range) {
    if(!document.googleLoggedIn){
        console.log("User not logged in");
        return;
    }
    const resource = {
        values: values,
        majorDimension: "ROWS"
    };

    console.log(values);

    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: resource
    }).then(function(response) {
        console.log(response)
    }, function(response) {});
}

function readFromGoogleSheets(callback){
        gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Highscores!A1:F'
    }).then(function(response) {
        callback(response)
    }, function(response) {
        appendPre('Error: ' + response.result.error.message);
    });
}