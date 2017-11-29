/*global chrome, document, window*/
/* eslint-env es6 */

"use strict";

/*A simple attempt to wait for the page to finish loading*/
function ready(main) {
  if (document.readyState === 'complete') {
    return main();
  }
  document.addEventListener('DOMContentLoaded', main, false);
}

/*Mimics the jQuery toggle method*/
function toggle(elem) {
  elem.style.display = (elem.style.display == 'none') ? 'block' : 'none';
}

/*Populates the pop-up with the bookmark bar's bookmarks and folders*/
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
    makeCheckboxesInteractive();
  });
}

/*Decides whether or not the folder is a bookmark or folder*/
function displayNodes(node, parent) {
  parent = parent || document.getElementById("bookmarks");

  if (node.children) {
    displayFolder(node, parent);
  } else {
    displayBookmark(node, parent);
  }
}

/*Populates the popup with a folder from the given node*/
function displayFolder(node, parent) {
  let folder = document.createElement('div');
  folder.classList.add('folder');
  parent.appendChild(folder);

  let folderInput = document.createElement('input');
  folderInput.setAttribute('type', 'checkbox');
  folderInput.classList.add('folder-checkbox');
  folder.appendChild(folderInput);

  let folderToggle = document.createElement('span');
  folderToggle.classList.add('folder-arrow');
  folderToggle.classList.add('accordion-toggle');
  folderToggle.append('▶');
  folder.appendChild(folderToggle);

  let icon = document.createElement('img');
  icon.setAttribute('src', 'icon.png');
  icon.classList.add('icon');
  icon.classList.add('folder-icon');
  folder.appendChild(icon);

  folder.append(node.title);

  // Creates the div holding the folder's contents
  let contents = document.createElement('div');
  contents.classList.add('folder-contents');
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

  // Animates arrow and adds accordion functionality
  folder.onclick = function animateArrow() {
    if (folderToggle.classList.contains('rotated')) {
      folderToggle.classList.remove('rotated');
    } else {
      folderToggle.classList.add('rotated');
    }

    toggle(contents);
  }
}

/*Populates the popup with a bookmark from the given node*/
function displayBookmark(node, parent) {
  let bookmarkOption = document.createElement('label');
  bookmarkOption.classList.add('bookmark');

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

/*Adds checkbox features to folder and bookmark checkboxes*/
function makeCheckboxesInteractive() {
  const folders = document.getElementsByClassName('folder-checkbox');
  const folderToggles = document.getElementsByClassName('folder-arrow');
  const contents = document.getElementsByClassName('folder-contents');

  // Selecting a bookmark changes the parent's checked status
  for (let input of document.querySelectorAll('.bookmark-checkbox')) {
    input.onclick = function updateCheckboxes() {
      updateAllFolderCheckboxes(folders, contents);
    }
  }
  for (let i = 0; i < folders.length; i++) {
    // Selecting a folder toggles selecting all of it's children
    folders[i].onclick = function () {
      for (let input of contents[i].querySelectorAll('input')) {
        input.checked = folders[i].checked;
      }
      updateAllFolderCheckboxes(folders, contents);

      // This is to undo the effect of clicking on the folder
      toggle(contents[i]);
      if (folderToggles[i].classList.contains('rotated')) {
        folderToggles[i].classList.remove('rotated');
      } else {
        folderToggles[i].classList.add('rotated');
      }
    }
  }
}

/*Finding a parent folder is hard, so update everyone instead*/
function updateAllFolderCheckboxes() {
  const folders = document.getElementsByClassName('folder-checkbox');
  const contents = document.getElementsByClassName('folder-contents');

  // Marks parent folders with their respective states
  for (let i = folders.length - 1; i >= 0; i--) {
    // -- instead of ++ so children are updated before parents
    let checkboxes = contents[i].querySelectorAll('input');
    let checkedNum = contents[i].querySelectorAll('input:checked');
    if (checkboxes.length > 0) {
      if (checkedNum.length === checkboxes.length) {
        folders[i].checked = true;
        folders[i].indeterminate = false;
      } else if (checkedNum.length > 0) {
        folders[i].checked = false;
        folders[i].indeterminate = true;
      } else {
        folders[i].checked = false;
        folders[i].indeterminate = false;
      }
    }
  }

  // Send the selected bookmarks to the background
  let tabState = [];
  const checked = document.querySelectorAll('.bookmark-checkbox:checked + a');
  for (const bookmark of checked) {
    tabState.push(bookmark.href);
  }
  port.postMessage({'tabState': tabState});
}

function linkOptionsPage() {
  document.getElementById('settings-icon').onclick = function linkOptions() {
    if (chrome.runtime.openOptionsPage) {
      // New way to open options pages, if supported (Chrome 42+)
      chrome.runtime.openOptionsPage();
    } else {
      // Reasonable fallback
      window.open(chrome.runtime.getURL('options.html'));
    }
  }
}

/*Adds functionality to the on/off button*/
function enableStartButton() {
  const label = document.querySelector('.switch');
  const checkbox = label.querySelector('#start-button');
  label.onclick = function toggleStart(event) {
    if (event.target.tagName == 'INPUT') { // since label sends one too
      if (checkbox.checked) {
        port.postMessage({'startOpening': true});
      } else {
        port.postMessage({'stopOpening': true});
      }
    }
  }
}

/*Queries the background for what tabs have been selected already*/
function getSelectedTabsAndNumTabs(msg) {
  if ('tabs' in msg) {
    let queuedTabs = JSON.parse(msg.tabs);

    //todo - checkmark the queued tabs

  } else if ('numTabs' in msg) {
    let numTabs = msg.numTabs;

    //todo - update the numTabs menu

  }
}

var port = chrome.runtime.connect({'name': 'Bookmark Opener'});
port.onMessage.addListener(getSelectedTabsAndNumTabs);
port.postMessage({'initializePopup': true});

/*Acts like the main method*/
ready(function main() {
  viewBookmarks();
  linkOptionsPage();
  enableStartButton();
});
