var apodData;
var apodStartDate = moment("1996-06-16");
var todayDate = moment();

// ajax query object for APOD API
var ajaxSettings = {
    url: "https://api.nasa.gov/planetary/apod?api_key=",
    success: function(result) {
        apodData = result;
        //console.log(JSON.stringify(apodData));
        updateDOM(apodData);
    }
};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBcSUvpRjeWIpz3aOWegvo7ELchZRPRU7w",
    authDomain: "apod-app.firebaseapp.com",
    databaseURL: "https://apod-app.firebaseio.com",
    storageBucket: "apod-app.appspot.com",
    messagingSenderId: "235809363063"
};
firebase.initializeApp(config);

// update ajaxSetting object's url to get previous day's data
$('#prev').click(prev);

// update ajaxSetting object's url to get previous day's data
$('#next').click(next);

// enable left and right arrow key use
// like buttons
$(document).keydown(function(e) {
    //console.log(e.keyCode);
    if (e.keyCode === 37) {
        prev(e);
    }
    else if (e.keyCode == 39) {
        next(e);
    }
});

// go to the next date
function next(e) {
    e.preventDefault();
    checkDateRange();
    if (!$("#next").prop("disabled")) {
        var nextDate = moment(apodData.date).add(1, 'd');
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + nextDate.format("YYYY-MM-DD");
        $.ajax(ajaxSettings)
            .fail(function (xhr){
                console.log("ERROR: " + xhr.status + ". Skipping bad date.");
                if (xhr.status === 500) {
                    skipDate(nextDate, "forward");
                }
            });
    }
}

// go to the previous date
function prev(e) {
    e.preventDefault();
    checkDateRange();
    if (!$("#prev").prop("disabled")) {
        var prevDate = moment(apodData.date).subtract(1, 'd');
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + prevDate.format("YYYY-MM-DD");
        $.ajax(ajaxSettings)
            .fail(function(xhr){
                console.log("ERROR: " + xhr.status + ". Skipping bad date.");
                if (xhr.status === 500) {
                    skipDate(prevDate, "backward");
                }
            });
    }
}

// skip bad dates that produce error 500 Internal Server Error
function skipDate(date, direction) {
    if (direction === 'backward') {
        var prevDate = date.subtract(1, 'd');
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + prevDate.format("YYYY-MM-DD");
        $.ajax(ajaxSettings);
    } else if (direction === "forward") {
        var nextDate = date.add(1, 'd');
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + nextDate.format("YYYY-MM-DD");
        $.ajax(ajaxSettings);
    }
}

// disable buttons if next or prev date is beyond the current
// date or before the APOD birthday.
function checkDateRange() {
    var nextDate = moment(apodData.date).add(1, 'd');
    var prevDate = moment(apodData.date).subtract(1, 'd');
    if (nextDate >= todayDate) {
        $("#next").prop("disabled", true);
    }
    else {
        $("#next").prop("disabled", false);
    }

    if (prevDate <= apodStartDate) {
        $("#prev").prop("disabled", true);
    }
    else {
        $("#prev").prop("disabled", false);
    }
}

// updateDOM inserts apodData into the DOM
function updateDOM(apodData) {
    $('#spinner').addClass('is-active');
    checkDateRange();
    var httpsStr = "https://" + apodData.url.match(/[^http:\/\/].+/);
    // if there is a HD image available use that as anchor
    if (apodData.hasOwnProperty('hdurl')) {
        var httpsStrHD = "https://" + apodData.hdurl.match(/[^http:\/\/].+/);
    }
    else {
        // otherwise use the standard one
        httpsStrHD = httpsStr;
    }

    $('#title').html(apodData.title);

    if (apodData.media_type === 'image') {
        $('#media').html('<a href=' + httpsStrHD + ' target="_blank"><img id="apod-image" src=' + httpsStr + '></a>');
        $('#apod-image').on('load', function() {
            $("#spinner").removeClass("is-active");
        });
    }
    else if (apodData.media_type === 'video' && apodData.url.match(/https:\/\//) == "https://") {
        $('#media').html('<iframe id="ytplayer" type="text/html" width="400" height="400"' +
            'src = ' + apodData.url + ' frameborder = "0">< / iframe > ');
        $('#ytplayer').on('load', function() {
            $("#spinner").removeClass("is-active");
        });
    }
    else {
        $('#media').addClass('http-media');
        $('#media').html('<a href=' + apodData.url + ' target="_blank" class="http-link"><p>Click here to open media.</p></a>');
        $('#support').text("");
    }
    // credit author if not public domain
    if (apodData.hasOwnProperty('copyright')) {
        $('#support').html("Image credit and copyright: " + apodData.copyright);
    }
    $('#apod-date').html(moment(apodData.date).format("L"));
    $('#explanation').html('<p>' + apodData.explanation + '</p>');
}

function initApp() {
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // user is signed in
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var keyData = "not set";
            // api key from database
            var keyRef = firebase.database().ref('/');
            keyRef.once('value').then(function(dataSnapshot) {
                keyData = dataSnapshot.val().api_key;
                ajaxSettings.url += keyData + "&date=" + moment().format("YYYY-MM-DD");
                // make ajax call to NASA APOD API
                $.ajax(ajaxSettings);
                //console.log(keyData);
                // [START signout]
                firebase.auth().signOut();
                // [END signout]
            });
        }
        else {
            // Fires before signin and after signout
            //console.log("Waiting for auth!");
        }
    });
    // [END authstatelistener]
    // [START authanon]
    firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/operation-not-allowed') {
            alert('You must enable Anonymous auth in the Firebase Console.');
        }
        else {
            console.error(error);
        }
        // [END_EXCLUDE]
    });
    // [END authanon]
}

window.onload = function() {
    initApp();
};
