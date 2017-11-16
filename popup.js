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
  chrome.bookmarks.getTree(function displayTree(tree) {
    tree = tree[0];
    let bookmarksBar;
    for (const bookmarkFolder of tree.children) {
      if (bookmarkFolder.title == 'Bookmarks bar') {
        bookmarksBar = bookmarkFolder;
      }
    }
    for (let node of bookmarksBar.children) {
      displayNodes(node);
    }
  });
}

function displayNodes(node, parent) {
  parent = parent || document.getElementById("bookmarks");

  if (node.children) {
    displayFolder(node, parent);
  } else {
    displayBookmark(node, parent);
  }
}

function displayFolder(node, parent) {
  //display the folder title
  let folder = document.createElement('label');

  let folderInput = document.createElement('input');
  folderInput.setAttribute('type', 'checkbox');
  folderInput.classList.add('folder-checkbox');
  folder.appendChild(folderInput);

  let folderToggle = document.createElement('span');
  folderToggle.classList.add('accordion-toggle');
  folderToggle.append('+');
  folder.appendChild(folderToggle);

  let icon = document.createElement('img');
  icon.setAttribute('src', 'icon.png');
  icon.classList.add('icon');
  folder.append(icon);

  folder.append(node.title);
  let folderContainer = document.createElement('div');
  folderContainer.appendChild(folder);
  parent.appendChild(folder);

  //creates the div holding the folder's contents
  let contents = document.createElement('div');
  contents.classList.add('accordion-content');
  if (node.children.length === 0) {
    let text = document.createElement('p');
    text.append('empty');
    contents.appendChild(text);
  } else {
    for (let child of node.children) {
      displayNodes(child, contents);
    }
  }
  parent.appendChild(contents);
  contents.style.display = 'none';

  //Adds accordion functionality
  folderToggle.onclick = function () {
    toggle(contents);
  }
}

function displayBookmark(node, parent) {
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

function displayTabsNum(num) {
  chrome.browserAction.setBadgeBackgroundColor({
    color: [190, 190, 190, 0]
  });
  chrome.browserAction.setBadgeText({
    text: String(num)
  });
}

function clearTabsNum() {
  chrome.browserAction.setBadgeText({
    text: ''
  });
}

ready(function main() {
  displayTabsNum(5); //this is to appease the linter for now
  clearTabsNum(); //this one too
  viewBookmarks();
});
