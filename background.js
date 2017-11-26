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

//todo - communicate with the popup to update the bookmarkQueue
//todo - communicate with the popup to send the bookmarkQueue
//todo - communicate with the popup to send the length of BookmarkQueue

/*
EXAMPLE FROM STACKOVERFLOW

// In the extension JS
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // Fetch the current tab
  chrome.tabs.sendMessage(tabs[0].id, {message: "preach", preachText: usrMessage});
});

// In the context script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == "preach"){ // Filter out other messages
      alert(request.preachText, 5000);
    }
});
*/

/*
EXAMPLE FROM STACKOVERFLOW

 *BACKGROUND.JS

 * onMessage from the extension or tab (a content script)

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.cmd == "any command") {
      sendResponse({ result: "any response from background" });
    } else {
      sendResponse({ result: "error", message: `Invalid 'cmd'` });
    }
    // Note: Returning true is required here!
    //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
    return true;
  });

  * POPUP.JS

// If you want to sendMessage from any popup or content script,
// use `chrome.runtime.sendMessage()`.

// Send message to background:
chrome.runtime.sendMessage(p, function(response) {
  console.log(`message from background: ${JSON.stringify(response)}`);
});


// If you want to sendMessage from tab of browser,
// use `chrome.tabs.sendMessage()`.

// Send message from active tab to background:
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, p, function(response) {
    console.log(`message from background: ${JSON.stringify(response)}`);
  });
});
*/
