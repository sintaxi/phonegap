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
 * This class provides access to the device contacts.
 * @constructor
 */

function Contacts() {
	
};

function Contact() {
    this.phones = [];
    this.emails = [];
	this.name = {
		givenName: "",
		familyName: "",
		formatted: ""
	};
	this.id = "";
};

Contact.prototype.displayName = function()
{
    // TODO: can be tuned according to prefs
	return this.givenName + " " + this.familyName;
};

function ContactsFilter(name) {
	if (name)
		this.name = name;
	else
		this.name = "";
};

/*
 * @param {ContactsFilter} filter Object with filter properties. filter.name only for now.
 * @param {function} successCallback Callback function on success
 * @param {function} errorCallback Callback function on failure
 * @param {object} options Object with properties .page and .limit for paging
 */

Contacts.prototype.find = function(filter, successCallback, errorCallback, options) {
	errorCallback({ name: "ContactsError", message: "Cordova Palm contacts not implemented" });
};

Contacts.prototype.success_callback = function(contacts_iterator) {
};

if (typeof navigator.contacts == "undefined") navigator.contacts = new Contacts();
