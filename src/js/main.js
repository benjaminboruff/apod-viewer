// @flow
import './material';
import moment from 'moment';
import firebase from 'firebase';
import $ from 'jquery';
import { ajaxSettings, firebaseConfig, startDate } from './config.json';
import { next, prev, checkDateRange } from './nav';
import { updateDOM } from './dom';

// global data store for the current apod object
// from apod api call
var apodDataStore: Object = {};

firebase.initializeApp(firebaseConfig);

// enable left and right arrow key use
// like buttons
$(document).keydown(function(e) {
    //console.log(e.keyCode);
    if (e.keyCode === 37) {
        prev(apodDataStore);
    }
    else if (e.keyCode == 39) {
        next(apodDataStore);
    }
});

// update ajaxSetting object's url to get previous day's data
$('#prev').click(function(e) {
    e.preventDefault();
    prev(apodDataStore);
});

// update ajaxSetting object's url to get previous day's data
$('#next').click(function(e) {
    e.preventDefault();
    next(apodDataStore);
});

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
                $.ajax(ajaxSettings)
                    .done(function(data) {
                        apodDataStore = data;
                        //console.log(JSON.stringify(apodData));
                        updateDOM(apodDataStore);
                    });
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
