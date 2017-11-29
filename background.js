/*global chrome*/
/* eslint-env es6 */

"use strict";

var bookmarkQueue = [];
var openedTabIds = [];
var numTabs = 4;

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

/*Replaces the queue with a given array of tabs*/
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
function connectToPopup(port) {
  if ('name' in port && port.name == 'Bookmark Opener') {
    port.onMessage.addListener(function respondToMessage(msg) {
      if ('initializePopup' in msg) {
        chrome.storage.sync.get({'numTabs': numTabs},
          function updateNumTabs(result) {
            numTabs = result.numTabs;
            port.postMessage({'numTabs': numTabs});
          }
        );
        port.postMessage({'tabs': JSON.stringify(bookmarkQueue)});
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
      stopOpening();
    });

  }
}

function main() {
  chrome.runtime.onConnect.addListener(connectToPopup);
}

main();
