import moment from 'moment';
import $ from 'jquery';
import { ajaxSettings, startDate } from './config.json';
import { updateDOM } from './dom';

// disable buttons if next or prev date is beyond the current
// date or before the APOD birthday.
function checkDateRange(dateStr) {
    var todayDate = moment();
    var apodStartDate = moment(startDate);
    var nextDate = moment(dateStr).add(1, 'd');
    var prevDate = moment(dateStr).subtract(1, 'd');
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

// is it okay to go to next apod date?
function nextOkay(dateStr) {
    var todayDate = moment();
    var nextMoment = moment(dateStr);

    if (nextMoment <= todayDate) {
        return true;
    }
    else {
        return false;
    }
}

// is it okay to go to prev apod date?
function prevOkay(dateStr) {
    var apodStartDate = moment(startDate);
    var prevMoment = moment(dateStr);

    if (prevMoment >= apodStartDate) {
        return true;
    }
    else {
        return false;
    }
}

// go to the next date
function next(apodDataStore) {
    //e.preventDefault();
    var nextDate = moment(apodDataStore.date).add(1, 'd').format("YYYY-MM-DD");
    //console.log("Next date is: " + nextDate);
    if (nextOkay(nextDate)){
    //if (!$("#next").prop("disabled")) {
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + nextDate;
        $.ajax(ajaxSettings)
            .done(function(data) {
                Object.assign(apodDataStore, data);
                //console.log(JSON.stringify(apodData));
                updateDOM(apodDataStore);
            })
            .fail(function(xhr) {
                console.log("ERROR: " + xhr.status + ". Skipping bad date.");
                if (xhr.status === 500) {
                    skipDate(apodDataStore, "forward");
                }
            });
    //}
    }
}

// go to the previous date
function prev(apodDataStore) {
    //e.preventDefault();
    var prevDate = moment(apodDataStore.date).subtract(1, 'd').format("YYYY-MM-DD");
    //console.log("Prev date is: " + prevDate);
    if (prevOkay(prevDate)){
    //if (!$("#prev").prop("disabled")) {
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + prevDate;
        $.ajax(ajaxSettings)
            .done(function(data) {
                Object.assign(apodDataStore, data);
                //console.log(JSON.stringify(apodData));
                updateDOM(apodDataStore);
            })
            .fail(function(xhr) {
                console.log("ERROR: " + xhr.status + ". Skipping bad date.");
                if (xhr.status === 500) {
                    skipDate(apodDataStore, "backward");
                }
            });
    //}
    }
}

// skip bad dates that produce error 500 Internal Server Error
function skipDate(apodDataStore, direction) {
    if (direction === 'backward') {
        var prevDate = moment(apodDataStore.date).subtract(2, 'd').format("YYYY-MM-DD");
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + prevDate;
        $.ajax(ajaxSettings)
            .done(function(data) {
                Object.assign(apodDataStore, data);
                //console.log(JSON.stringify(apodData));
                updateDOM(apodDataStore);
            });
    }
    else if (direction === "forward") {
        var nextDate = moment(apodDataStore.date).add(2, 'd').format("YYYY-MM-DD");
        ajaxSettings.url = ajaxSettings.url.match(/^[https:\/\/\w*.\?api\_key\=]*/) + "&date=" + nextDate;
        $.ajax(ajaxSettings)
            .done(function(data) {
                Object.assign(apodDataStore, data);
                //console.log(JSON.stringify(apodData));
                updateDOM(apodDataStore);
            });
    }
}

export { next, prev, checkDateRange };