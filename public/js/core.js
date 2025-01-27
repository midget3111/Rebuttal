'use strict';

/**
 * List of parts that need to be globally passed about
 */
// Websocket
var ws = null;
// State of client
var roomlist = [];
var userlist = [];
var messagelist = [];
var currentView = '';
var iam = null;
var localWebcamStream = null;
var localLiveStream = null;
var remoteWebcamStream = {};
var remoteLiveStream = {};
var peerConnection = {};
var el = {};
var isWebcam = false;
var isScreenShare = false;
var isMute = false;
var isSettings = false;
var isServer = false;
var lastChatYPos = 0;
var cacheDragAndDropFile = null;
var cacheUserTagged = [];
var sharedVideo = null;
var permissions = [];
var groups = [];
var signUpCode = null;
var autocompleteing = null;
var autocompletestart = 0;
var autocompleteselection = 0;
var electronMode = false;
var customUrl = null;
var overlayEnable = true;
// Browser storage

var theme = null;
var font = null;
var themelist = [];

// Functions to allow to be used in console
var markupParser;
var changeTheme;
var changeFont;
var toggleSettings;
var toggleServer;
var startLocalDevices;
var updateThemesInSettings;
var updateInputsInSettings;
var updateOutputsInSettings;
var getUserByID;
var getUsersByPartialName;
var loadMoreText;
var playToGroup;
var send;
var connect;
var populateRoom;

getUserByID = (id) => {
    var ret = null;
    userlist.forEach(user => {
        if (user.id == id) {
            ret = user;
        }
    })
    return ret;
}

getUsersByPartialName = (nameFrag) => {
    var ret = [];
    userlist.forEach(user => {
        if (user.name.toLowerCase().indexOf(nameFrag.toLowerCase()) == 0) {
            console.log(nameFrag + " matches " + user.name);
            ret.push(user);
        }
    });
    return ret;
}
console.log("Electron: " + ('electron' in window));

electronMode = /electron/i.test(navigator.userAgent)