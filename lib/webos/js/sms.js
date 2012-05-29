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

/*
 * This class provides access to the device SMS functionality.
 * @constructor
 */
function Sms() {

    };

/*
 * Sends an SMS message.
 * @param {Integer} number The phone number to send the message to.
 * @param {String} message The contents of the SMS message to send.
 * @param {Function} successCallback The function to call when the SMS message is sent.
 * @param {Function} errorCallback The function to call when there is an error sending the SMS message.
 * @param {PositionOptions} options The options for accessing the GPS location such as timeout and accuracy.
 */
Sms.prototype.send = function(number, message, successCallback, errorCallback, options) {
    try {
        this.service = navigator.service.Request('palm://com.palm.applicationManager', {
            method: 'launch',
            parameters: {
                id: "com.palm.app.messaging",
                params: {
                    composeAddress: number,
                    messageText: message
                }
            }
        });
        successCallback();
    } catch(ex) {
        errorCallback({
            name: "SMSerror",
            message: ex.name + ": " + ex.message
        });
    }
};

if (typeof navigator.sms == "undefined") navigator.sms = new Sms();

