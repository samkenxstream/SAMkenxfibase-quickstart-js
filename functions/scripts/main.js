/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var messagesRef = new Firebase('https://<YOUR_APP_ID>.firebaseio-staging.com/messages');

// Shortcuts to DOM Elements.
var messageList = document.getElementById('message-list');
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('message');
var nameInput = document.getElementById('name');

// Saves a new message on the Firebase DB.
function saveMessage() {
  if (messageInput.value && nameInput.value) {
    messagesRef.push({
      name: nameInput.value,
      message: messageInput.value,
      timestamp: Firebase.ServerValue.TIMESTAMP
    }, function(error){
      if (error) {
        console.log(error);
      } else {
        resetMaterialTextfield(messageInput);
        resetMaterialTextfield(nameInput);
      }
    });
  }
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
  element.blur();
}

// Displays a Visitor's Book Message in the UI.
function displayMessage(key, name, message, moderated) {
  var div = document.getElementById(key);
  if (!div) {
    div = document.createElement('div');
    div.setAttribute('id', key);
    messageList.insertBefore(div, messageList.firstChild);
  }
  var verb = 'said';
  if (message.replace(/[^A-Z]/g, '').length > message.length / 2
    || message.replace(/[^!]/g, '').length >= 3) {
    verb = 'yelled';
  }
  div.textContent = name + ' ' + verb + ' "' + message + '"' + (moderated ? ' (moderated)' : '');
}

// Bindings on load.
document.addEventListener('DOMContentLoaded', function() {
  // Saves message on form submit.
  messageForm.addEventListener('submit', saveMessage);

  var displayMessageFromFirebaseData = function(data) {
    var val = data.val();
    displayMessage(data.key(), val.name, val.message, val.moderated);
  }
  // Loads the last 10 messages and listen for new ones.
  messagesRef.limitToLast(10).on("child_added", displayMessageFromFirebaseData);
  // Listen for messages updates.
  messagesRef.limitToLast(10).on("child_changed", displayMessageFromFirebaseData);
}, false);