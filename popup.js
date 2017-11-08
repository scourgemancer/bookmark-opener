/*global chrome*/
/* eslint-env es6 */

"use strict";

function displayTabsNum( num ) {
  chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 0]});
  chrome.browserAction.setBadgeText({text: num});
}

function clearTabsNum() {
  chrome.browserAction.setBadgeText({text: ''});
}
