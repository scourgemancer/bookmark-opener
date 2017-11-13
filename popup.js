/*global chrome, document*/
/* eslint-env es6 */

"use strict";

function ready(main) {
  if (document.readyState === 'complete') {
    return main();
  }
  document.addEventListener('DOMContentLoaded', main, false);
}

function toggle(elem) {
  elem.style.display = (elem.style.display == 'none') ? 'block' : 'none';
}

function viewBookmarks() {
  let bookmarks = document.getElementById("bookmarks");
  chrome.bookmarks.getTree(function displayTree(tree) {
    tree = tree[0];
    let bookmarksBar;
    tree.children.forEach(function findBookmarksBar(bookmarkFolder){
      if (bookmarkFolder.title == 'Bookmarks bar') {
        bookmarksBar = bookmarkFolder;
      }
    });
    bookmarksBar.children.forEach(function displayNodes(node, index, arr, folder) {
      folder = folder || bookmarks; //makes it bookmarks if unprovided
      if (node.children) { //then it's a folder
        //display the folder title
        let title = document.createElement('p');
        title.append('+' + node.title);
        title.classList.add('accordion-toggle');
        folder.appendChild(title);

        //creates the div holding the folder's contents
        let contents = document.createElement('div');
        contents.classList.add('accordion-content');
        if (node.children.length === 0) {
          let text = document.createElement('p');
          text.append('empty');
          contents.appendChild(text);
        } else {
          node.children.forEach(function recursiveClosure(node, index, arr) {
            displayNodes(node, index, arr, contents);
          });
        }
        folder.appendChild(contents);
        contents.style.display = 'none';

        //Adds accordion functionality
        title.onclick=function() {toggle(contents);}
      } else {
        //it's an actual bookmark
        let bookmark = document.createElement('a');
        bookmark.setAttribute('href', node.url);
        let icon = document.createElement('img');
        icon.setAttribute('src', 'chrome://favicon/' + node.url);
        icon.classList.add('icon');
        bookmark.appendChild(icon);
        let title = document.createElement('p');
        title.append(node.title);
        bookmark.appendChild(title);
        folder.appendChild(bookmark);
      }
    });
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
  displayTabsNum(5); //this is to appease the linter for now
  clearTabsNum();    //this one too
  viewBookmarks();
});
