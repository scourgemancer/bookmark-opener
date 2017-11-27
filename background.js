/*global chrome*/
/* eslint-env es6 */

"use strict";

var bookmarkQueue = [];
var openedTabsIds = [];

function enqueueTab(tab) {
  bookmarkQueue.push(tab);
}

function dequeueTab() {
  return bookmarkQueue.shift();
}

function openTab(newURL) {
  chrome.tabs.create({ url: newURL }, function addTabId(tab){
    openedTabsIds.push(tab.id);
  });
}

function activatedTabListener(tab) {
  for (let i = 0; i < openedTabsIds.length; i++) {
    if (tab.id == openedTabIds[i]) {
      openedTabsIds.splice(i, 1);
    }
    while (openedTabsIds.length < numTabs && bookmarkQueue.length > 0) {
      openTab( dequeueTab() );
    }
  }
}

function startOpening() {
  for (let i = 0; i < numTabs && bookmarkQueue.length > 0; i++) {
    openTab( dequeueTab() );
  }
  chrome.tabs.onActivated.addListener(activatedTabListener);
}

function stopOpening() {
  chrome.tabs.onActivated.removeListener(activatedTabListener);
  openedTabsIds = [];
}

chrome.runtime.onMessage.addListener(
  function getMessages(request, sender, sendResponse) {

  }
);

//todo - communicate with the popup to update the bookmarkQueue (update badge from here)
//todo - communicate with the popup on opening: to send the bookmarkQueue

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
