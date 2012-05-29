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

function Service() {
	
};

Service.prototype.Request = function (uri, params) {
	var req = new PalmServiceBridge();
	var url = uri + "/" + (params.method || "");
	req.url = url;

	this.req = req;
	this.url = url;
	this.params = params || {};
	
	this.call(params);
	
	return this;
};

Service.prototype.call = function(params) {
	var onsuccess = null;
	var onfailure = null;
	var oncomplete = null;

	if (typeof params.onSuccess === 'function')
		onsuccess = params.onSuccess;

	if (typeof params.onFailure === 'function')
		onerror = params.onFailure;

	if (typeof params.onComplete === 'function')
		oncomplete = params.onComplete;

	this.req.onservicecallback = callback;

	function callback(msg) {
		var response = JSON.parse(msg);

		if ((response.errorCode) && onfailure)
			onfailure(response);
		else if (onsuccess)
			onsuccess(response);
		
		if (oncomplete)
			oncomplete(response);
	}

	this.data = (typeof params.parameters === 'object') ? JSON.stringify(params.parameters) : '{}';

	this.req.call(this.url, this.data);
}

if (typeof navigator.service == "undefined") navigator.service = new Service();

