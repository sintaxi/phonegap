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

function Network() {
    /*
     * The last known Network status.
     */
	this.lastReachability = null;
};

Network.prototype.isReachable = function(hostName, successCallback, options) {
	this.request = navigator.service.Request('palm://com.palm.connectionmanager', {
	    method: 'getstatus',
	    parameters: {},
	    onSuccess: function(result) { 
		
			var status = NetworkStatus.NOT_REACHABLE;
			if (result.isInternetConnectionAvailable == true) {

				if (result.wan.state == "connected") {
					status = NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK;
				}
				
				if (result.wifi.state == "connected") {
					status = NetworkStatus.REACHABLE_VIA_WIFI_NETWORK;
				}
							
			}
			successCallback(status); 
		},
	    onFailure: function() {}
	});

};

Network.prototype.connection = function(hostName, successCallback, options) {
	this.request = navigator.service.Request('palm://com.palm.connectionmanager', {
	    method: 'getstatus',
	    parameters: {},
	    onSuccess: function(result) { 
			successCallback(result); 
		},
	    onFailure: function() {}
	});	
};

Network.prototype.connection.type = function(hostName, successCallback, options) {
	navigator.network.isReachable(hostName,successCallback, options);
};

function Connection() {
	this.code = null;
	this.message = "";
};

Connection.UNKNOWN = 'unknown';
Connection.ETHERNET = 'ethernet';
Connection.WIFI = 'wifi';
Connection.CELL_2G = '2g';
Connection.CELL_3G = '3g';
Connection.CELL_4G = '4g';
Connection.NONE = 'none';

/*
 * This class contains information about any NetworkStatus.
 * @constructor
 */
function NetworkStatus() {
	this.code = null;
	this.message = "";
};

NetworkStatus.NOT_REACHABLE = 0;
NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK = 1;
NetworkStatus.REACHABLE_VIA_WIFI_NETWORK = 2;

if (typeof navigator.network == "undefined") navigator.network = new Network();

