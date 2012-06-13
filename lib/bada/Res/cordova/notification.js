/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

MessageBox.MSGBOX_STYLE_NONE = 0;
MessageBox.MSGBOX_STYLE_OK = 1;
MessageBox.MSGBOX_STYLE_CANCEL = 2;
MessageBox.MSGBOX_STYLE_OKCANCEL = 3;
MessageBox.MSGBOX_STYLE_YESNO = 4;
MessageBox.MSGBOX_STYLE_YESNOCANCEL = 5;
MessageBox.MSGBOX_STYLE_ABORTRETRYIGNORE = 6;
MessageBox.MSGBOX_STYLE_CANCELTRYCONTINUE = 7;
MessageBox.MSGBOX_STYLE_RETRYCANCEL = 8;

/**
 * This class provides access to notifications on the device.
 */
function Notification() {
  this.messageBox = new MessageBox("Test Alert", "This is an alert", "OK");
}

/*
 * MessageBox: used by Bada to retrieve Dialog Information
 */

function MessageBox(title, message, messageBoxStyle) {
  this.title = title;
  this.message = message;
  this.messageBoxStyle = messageBoxStyle;
}

labelsToBoxStyle = function(buttonLabels) {
  if(!buttonLabels)
    return MessageBox.MSGBOX_STYLE_NONE;
  if(buttonLabels == "OK")
    return MessageBox.MSGBOX_STYLE_OK;
  if(buttonLabels == "Cancel")
    return MessageBox.MSGBOX_STYLE_CANCEL;
  if(buttonLabels == "OK,Cancel")
    return MessageBox.MSGBOX_STYLE_OKCANCEL;
  if(buttonLabels == "Yes,No")
    return MessageBox.MSGBOX_STYLE_YESNO;
  if(buttonLabels == "Yes,No,Cancel")
    return MessageBox.MSGBOX_STYLE_YESNOCANCEL;
  if(buttonLabels == "Abort,Retry,Ignore")
    return MessageBox.MSGBOX_STYLE_ABORTRETRYIGNORE;
  if(buttonLabels == "Cancel,Try,Continue")
    return MessageBox.MSGBOX_STYLE_CANCELTRYCONTINUE;
  if(buttonLabels == "Retry,Cancel")
    return MessageBox.MSGBOX_STYLE_RETRYCANCEL;

  return MessageBox.MSGBOX_STYLE_NONE;
}

/**
 * Open a native alert dialog, with a customizable title and button text.
 * @param {String}   message          Message to print in the body of the alert
 * @param {Function} completeCallback The callback that is invoked when user clicks a button.
 * @param {String}   title            Title of the alert dialog (default: 'Alert')
 * @param {String}   buttonLabel      Label of the close button (default: 'OK')
 */
Notification.prototype.alert = function(message, completeCallback, title, buttonLabel) {
    var _title = (title || "Alert");
    this.messageBox = new MessageBox(_title, message, labelsToBoxStyle(buttonLabel));
    Cordova.exec(completeCallback, null, 'org.apache.cordova.Notification', 'alert', []);
};

/**
 * Open a custom confirmation dialog, with a customizable title and button text.
 * @param {String}  message         Message to print in the body of the dialog
 * @param {Function}resultCallback  The callback that is invoked when a user clicks a button.
 * @param {String}  title           Title of the alert dialog (default: 'Confirm')
 * @param {String}  buttonLabels    Comma separated list of the button labels (default: 'OK,Cancel')
 */
Notification.prototype.confirm = function(message, resultCallback, title, buttonLabels) {
    var _title = (title || "Confirm");
    var _buttonLabels = (buttonLabels || "OK,Cancel");
    this.messageBox = new MessageBox(_title, message, labelsToBoxStyle(buttonLabels));
    return Cordova.exec(resultCallback, null, 'org.apache.cordova.Notification', 'confirm', []);
};

/**
 * Causes the device to vibrate.
 * @param {Integer} mills The number of milliseconds to vibrate for.
 */
Notification.prototype.vibrate = function(mills) {
    Cordova.exec(null, null, 'org.apache.cordova.Notification', 'vibrate', [mills]);
};

/**
 * Causes the device to beep.
 * @param {Integer} count The number of beeps.
 */
Notification.prototype.beep = function(count) {
    Cordova.exec(null, null, 'org.apache.cordova.Notification', 'beep', [count]);
};

Cordova.addConstructor(function() {
    if (typeof navigator.notification == "undefined") navigator.notification = new Notification();
});
