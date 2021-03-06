// @flow
import moment from 'moment';
import $ from 'jquery';
import { prev, next, checkDateRange } from './nav';

// updateDOM inserts apodDataStore into the DOM
function updateDOM(apodDataStore: Object): void {
    checkDateRange(apodDataStore.date);
    var httpsStr: string = "https://" + apodDataStore.url.match(/[^http:\/\/].+/);
    // if there is a HD image available use that as anchor
    if (apodDataStore.hasOwnProperty('hdurl')) {
        var httpsStrHD: string = "https://" + apodDataStore.hdurl.match(/[^http:\/\/].+/);
    }
    else {
        // otherwise use the standard one
        httpsStrHD = httpsStr;
    }

    $('#title').html(apodDataStore.title);

    if (apodDataStore.media_type === 'image') {
        
        $('#media').html('<a href=' + httpsStrHD + ' target="_blank"><img id="apod-image" data-src=' + httpsStr + '></a>');
        // swap url attributes ...
        $('#apod-image').attr('src', $('#apod-image').attr('data-src'));
        // ... so image fades in
        $('#apod-image').on('load', function() {
            $('#apod-image').removeAttr('data-src');
        });
    }
    else if (apodDataStore.media_type === 'video' && apodDataStore.url.match(/https:\/\//) == "https://") {
        $('#media').html('<iframe id="ytplayer" type="text/html" width="400" height="400"' +
            'src = ' + apodDataStore.url + ' frameborder = "0">< / iframe > ');
    }
    else {
        $('#media').addClass('http-media');
        $('#media').html('<a href=' + apodDataStore.url + ' target="_blank" class="http-link"><p>Click here to open media.</p></a>');
        $('#support').text("");
    }
    // credit author if not public domain
    if (!apodDataStore.hasOwnProperty('copyright') || apodDataStore.copyright === "") {
        $('#support').html(" ");
    }
    else {
        $('#support').html("Image credit and copyright: " + apodDataStore.copyright);
    }

    $('#apod-date').html(moment(apodDataStore.date).format("L"));
   
    $('#explanation').html('<p>' + apodDataStore.explanation + '</p>');
}

export {
    updateDOM
};
