/*global chrome*/
/* eslint-env es6 */

"use strict";

var bookmarkQueue = [];
var openedTabIds = [];

/*Adds a badge with the given number on it to the popup's icon*/
function displayTabsNum(num) {
  chrome.browserAction.setBadgeBackgroundColor({
    color: [190, 190, 190, 0]
  });
  chrome.browserAction.setBadgeText({
    text: String(num)
  });
}

/*Gets rid of any badge currently on the popup's icon*/
function clearTabsNum() {
  chrome.browserAction.setBadgeText({
    text: ''
  });
}

/*Removes a tab from the queue and updates the badge counter*/
function dequeueTab() {
  if (bookmarkQueue.length > 1) {
    displayTabsNum(bookmarkQueue - 1);
  } else {
    clearTabsNum();
  }
  return bookmarkQueue.shift();
}

function applyTabState(tabState) {
  bookmarkQueue = tabState;
  if (bookmarkQueue.length > 1) {
    displayTabsNum(bookmarkQueue - 1);
  } else {
    clearTabsNum();
  }
}

/*Opens a tab for a given URL*/
function openTab(newURL) {
  chrome.tabs.create({ url: newURL }, function addTabId(tab){
    openedTabIds.push(tab.id);
  });
}

/*Checks if the activated tab is one of ours and opens more, if needed*/
function activatedTabListener(tab) {
  for (let i = 0; i < openedTabIds.length; i++) {
    if (tab.id == openedTabIds[i]) {
      openedTabIds.splice(i, 1);
    }
    while (openedTabIds.length < numTabs && bookmarkQueue.length > 0) {
      openTab( dequeueTab() );
    }
    if (bookmarkQueue.length === 0) {
      stopOpening();
    }
  }
}

/*Starts opening the set number of tabs and listens to activating tabs*/
function startOpening() {
  for (let i = 0; i < numTabs && bookmarkQueue.length > 0; i++) {
    openTab( dequeueTab() );
  }
  chrome.tabs.onActivated.addListener(activatedTabListener);
}

/*Gets rid of the listeners and assumes all opened tabs will be read*/
function stopOpening() {
  chrome.tabs.onActivated.removeListener(activatedTabListener);
  openedTabIds = [];
}

/*Opens a port to the popup and sets up responding to popup actions*/
function connectPopup(port) {
  if (port.extentsion && port.extentsion == 'Bookmark Opener') {
    port.onMessage.addListener(function respondToMessage(msg) {
      if (msg.initializePopup) {
        port.postMessage(JSON.stringify(bookmarkQueue));
      } else if (msg.tabState) {
        let selectedBookmarks = JSON.parse(msg.tabState);
        applyTabState(selectedBookmarks);
      } else if (msg.startOpening) {
        startOpening();
      }
    });
    port.onDisconnect.addListener(function disconnectPopup(){
      stopOpening();
    });
  }
}

function main() {
  chrome.runtime.onConnect.addListener(connectPopup);
}

main();

/*
EXAMPLE FROM CHROME DEVELOPER
LONG LIVED CONNECTIONS

var port = chrome.runtime.connect({name: "knockknock"});
port.postMessage({joke: "Knock knock"});
port.onMessage.addListener(function(msg) {
  if (msg.question == "Who's there?")
    port.postMessage({answer: "Madame"});
  else if (msg.question == "Madame who?")
    port.postMessage({answer: "Madame... Bovary"});
});

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "knockknock");
  port.onMessage.addListener(function(msg) {
    if (msg.joke == "Knock knock")
      port.postMessage({question: "Who's there?"});
    else if (msg.answer == "Madame")
      port.postMessage({question: "Madame who?"});
    else if (msg.answer == "Madame... Bovary")
      port.postMessage({question: "I don't get it."});
  });
});
*/

/*
EXAMPLE FROM STACKOVERFLOW
SIMPLE ONE-TIME REQUEST

chrome.runtime.sendMessage( {message: "preach", preachText: usrMessage} , function(response) {
  console.log(`message from background: ${JSON.stringify(response)}`);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == "preach"){ // Filter out other messages
      console.log(request.preachText);
    }
    return true; //necessary for async if using sendResponse
});
*/
