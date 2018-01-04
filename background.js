/*global chrome*/
/* eslint-env es6 */

"use strict";

var bookmarkQueue = [];
var openedTabIds = [];
var numTabs = 3;
var currentlyOpening = false;
var port;

/*Returns the number of queued bookmarks*/
function getQueuedNum() {
  let num = 0;
  for (const bookmark of bookmarkQueue) {
    if (bookmark[1]) {
      num++;
    }
  }
  return num;
}

/*Adds a badge with the given number on it to the popup's icon*/
function displayTabsNum() {
  chrome.browserAction.setBadgeBackgroundColor({
    color: [190, 190, 190, 0]
  });
  chrome.browserAction.setBadgeText({
    text: String( getQueuedNum() )
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
  // Finds the first queued tab
  let tab;
  for (let bookmark of bookmarkQueue) {
    if (bookmark[1]) {
      tab = bookmark[0];
      bookmark[1] = false;
      break;
    }
  }

  // Signals the change to the popup, if open
  if (port) {
    port.postMessage({'tabs': JSON.stringify(bookmarkQueue)});
  }

  // Updates the badge counter
  if (getQueuedNum() > 0) {
    displayTabsNum();
  } else {
    clearTabsNum();
  }
  return tab;
}

/*Replaces the queue with a given array of tabs*/
function applyTabState(tabState) {
  bookmarkQueue = tabState;
  if (getQueuedNum() > 0) {
    displayTabsNum();
  } else {
    clearTabsNum();
  }
}

/*Opens a tab for a given URL*/
function openTab(newURL) {
  chrome.tabs.create({ 'url': newURL, 'selected': false },
    function addTabId(tab){
      openedTabIds.push(tab.id);
    }
  );
}

/*Checks if the activated tab is one of ours and opens more, if needed*/
function activatedTabListener(tab) {
  for (let i = 0; i < openedTabIds.length; i++) {
    if (tab.id == openedTabIds[i]) {
      openedTabIds.splice(i, 1);
    }
    while (openedTabIds.length < numTabs && getQueuedNum() > 0) {
      openTab( dequeueTab() );
    }
    if (getQueuedNum() === 0) {
      stopOpening();
    }
  }
}

/*Starts opening the set number of tabs and listens to activating tabs*/
function startOpening() {
  for (let i = 0; i < numTabs && getQueuedNum() > 0; i++) {
    let url = dequeueTab();
    openTab( url );
  }
  chrome.tabs.onActivated.addListener(activatedTabListener);
  currentlyOpening = true;
}

/*Gets rid of the listeners and assumes all opened tabs will be read*/
function stopOpening() {
  chrome.tabs.onActivated.removeListener(activatedTabListener);
  openedTabIds = [];
  currentlyOpening = false;
}

/*Opens a port to the popup and sets up responding to popup actions*/
function connectToPopup(newPort) {
  if ('name' in newPort && newPort.name == 'Bookmark Opener') {
    port = newPort;
    port.onMessage.addListener(function respondToMessage(msg) {
      if ('initializePopup' in msg) {
        chrome.storage.sync.get({'numTabs': numTabs},
          function updateNumTabs(result) {
            numTabs = result.numTabs;
            port.postMessage({'numTabs': numTabs});
          }
        );
        port.postMessage({'tabs': JSON.stringify(bookmarkQueue)});
        port.postMessage({'currentlyOpening': currentlyOpening});
      } else if ('tabState' in msg) {
        applyTabState( JSON.parse(msg.tabState) );
      } else if ('startOpening' in msg) {
        startOpening();
      } else if ('stopOpening' in msg) {
        stopOpening();
      } else if ('newTabNum' in msg) {
        chrome.storage.sync.set({'numTabs': msg.newTabNum});
        numTabs = msg.newTabNum;
      }
    });
    port.onDisconnect.addListener(function disconnectPopup(){
      port = false;
    });
  }
}

function main() {
  chrome.runtime.onConnect.addListener(connectToPopup);
}

main();
