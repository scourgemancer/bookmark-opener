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
    tree.children.forEach(function findBookmarksBar(bookmarkFolder) {
      if (bookmarkFolder.title == 'Bookmarks bar') {
        bookmarksBar = bookmarkFolder;
      }
    });
    bookmarksBar.children.forEach(function displayNodes(node, index, arr, parent) {
      parent = parent || bookmarks; //makes it bookmarks if unprovided
      if (node.children) { //then it's a folder
        //display the folder title
        let folder = document.createElement('label');
        let folderInput = document.createElement('input');
        folderInput.setAttribute('type', 'checkbox');
        folderInput.classList.add('folder-checkbox');
        folder.appendChild(folderInput);
        folder.append('+');
        let icon = document.createElement('img');
        icon.setAttribute('src', 'icon.png');
        icon.classList.add('icon');
        folder.append(icon);
        folder.append(node.title);
        folder.classList.add('accordion-toggle');
        parent.appendChild(folder);

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
        parent.appendChild(contents);
        contents.style.display = 'none';

        //Adds accordion functionality
        folder.onclick=function() {toggle(contents);}
      } else {
        //it's an actual bookmark
        let bookmarkOption = document.createElement('label');
        let bookmarkInput = document.createElement('input');
        bookmarkInput.setAttribute('type', 'checkbox');
        bookmarkInput.classList.add('bookmark-checkbox');
        bookmarkOption.appendChild(bookmarkInput);
        let bookmark = document.createElement('a');
        bookmark.setAttribute('href', node.url);
        let icon = document.createElement('img');
        icon.setAttribute('src', 'chrome://favicon/' + node.url);
        icon.classList.add('icon');
        bookmark.appendChild(icon);
        bookmark.append(node.title);
        bookmarkOption.appendChild(bookmark);
        parent.appendChild(bookmarkOption);
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
