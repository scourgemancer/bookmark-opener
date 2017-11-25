/*global chrome*/
/* eslint-env es6 */

"use strict";

/*
chrome.tabs.onCreated.addListener(function(tab) {
  let id = tab.id;
  let deleteme=id*2;
  id=deleteme;
});

chrome.tabs.onRemoved.addListener(function(tab) {
  let id = tab.id;
  let deleteme=id*2;
  id=deleteme;
});

chrome.tabs.onActivated.addListener(function(tab) {
  let id = tab.id;
  let deleteme=id*2;
  id=deleteme;
});
*/

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
