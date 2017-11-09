/*global chrome, document*/
/* eslint-env es6 */

"use strict";

function ready(main) {
  if (document.readyState === 'complete') {
    return main();
  }
  document.addEventListener('DOMContentLoaded', main, false);
}

function viewBookmarks() {
  let bookmarks = document.getElementById("bookmarks");
  chrome.bookmarks.getTree(function displayTree(tree){
    if (tree.length === 0) {
      let text = document.createTextNode("No Tabs found");
      bookmarks.appendChild(text);
    }
    else {
      let bookmarkList = document.createElement('UL');
      tree.forEach(function displayTree(node){
        if (node) {
          if (node.children) {
            let title = document.createElement('LI');
            title.append(node.title);
            bookmarkList.appendChild(title);
            node.children.forEach(displayTree);
          } else {
            let title = document.createElement('LI');
            title.append(node.title);
            bookmarkList.appendChild(title);
          }
        }
      });
      bookmarks.appendChild(bookmarkList);
    }
  });
}

function displayTabsNum( num ) {
  chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 0]});
  chrome.browserAction.setBadgeText({text: String(num)});
}

function clearTabsNum() {
  chrome.browserAction.setBadgeText({text: ''});
}

ready(function main() {
  displayTabsNum(5);  //these are to appease the linter for now
  clearTabsNum();
  viewBookmarks();
});
