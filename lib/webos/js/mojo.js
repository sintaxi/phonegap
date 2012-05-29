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

//===========================
//		Mojo Dependencies - we still need to rely on these minimal parts of the Mojo framework - should try to find if we can get access to lower level APIs
//							so that we can remove dependence of Mojo
//===========================
	
Mojo = {
	contentIndicator: false,

	// called by webOS in certain cases
	relaunch: function() {
		var launch = JSON.parse(PalmSystem.launchParams);
		
		if (launch['palm-command'] && launch['palm-command'] == 'open-app-menu')
			this.fireEvent(window, "appmenuopen");
		else
			this.fireEvent(window, "palmsystem", launch);
	},
	
	// called by webOS when your app gets focus
	stageActivated: function() {
		this.fireEvent(window, "activate");
	},

	// called by webOS when your app loses focus
	stageDeactivated: function() {
		this.fireEvent(window, "deactivate");
	},

	// this is a stub -- called by webOS when orientation changes
	// but the preferred method is to use the orientationchanged
	// DOM event
	screenOrientationChanged: function(dir) {
	},
	
	// used to redirect keyboard events to DOM event "back"
	onKeyUp: function(e) {
		if (e.keyCode == 27)
			this.fireEvent(window, "back");
	},
		
	// private method, used to fire off DOM events
	fireEvent: function(element, event, data) {
		var e = document.createEvent("Event");
		e.initEvent(event, false, true);
		
		if (data)
			e.data = data;
		
		element.dispatchEvent(e);
	},
	
	/*
	 	not sure if these stubs are still needed since the Log object is encapsulated in debugconsole class 
		and the Service object is encapsulated in the Service class
	*/
	// stubs to make v8 happier
	Service: {},
	Log: {}
	
};
