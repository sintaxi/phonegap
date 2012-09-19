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
* Cordova Sample App
*
*/

// Geolocation
var watchLocationID = null;

function onGeoLocationSuccess(position) {
    var element = document.getElementById('geolocation');
    element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                        'Longitude: ' + position.coords.longitude     + '<br />' +
                        '<hr />'      + element.innerHTML;
}

function onGeoLocationError(error) {
    debugPrint('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}
function getCurrentPosition() {
	var geolocation = document.getElementById('geolocation');
	try {
    Geolocation.useCordova();
		geolocation.style.display = 'block';
		navigator.geolocation.getCurrentPosition(onGeoLocationSuccess, onGeoLocationError, { frequency: 3000 });
	} catch(e) {
		alert(e.message);
	}
}
function toggleWatchPosition(em) {
	var geolocation = document.getElementById('geolocation');
	if(em.value == "GeoLocation.StartWatching") {
		em.value = "GeoLocation.StopWatching";
		geolocation.style.display = 'block';
		try {
			Geolocation.useCordova();
			watchLocationID = navigator.geolocation.watchPosition(onGeoLocationSuccess, onGeoLocationError, { frequency: 3000 });
		} catch(e) {
			alert(e.message);
		}
	} else {
		em.value = "GeoLocation.StartWatching";
		geolocation.style.display = 'none';
		try {
			navigator.geolocation.clearWatch(watchLocationID);
			geolocation.innerHTML = '';
		} catch(e) {
			alert(e.message);
		}
	}
}

// Acceleration
var watchAccelerationID = null;

function onAccelerationSuccess(acceleration) {
    var element = document.getElementById('accelerometer');
    element.innerHTML = 'Acceleration X: ' + acceleration.x + '<br />' +
                        'Acceleration Y: ' + acceleration.y + '<br />' +
                        'Acceleration Z: ' + acceleration.z + '<br />' +
                        'Timestamp: '      + acceleration.timestamp + '<br />';
}

function onAccelerationError() {
    alert('onError!');
}

function startWatchAcceleration() {
  var options = { frequency: 3000 };
  watchAccelerationID = navigator.accelerometer.watchAcceleration(onAccelerationSuccess, onAccelerationError, options);
}

function stopWatchAcceleration() {
    if (watchAccelerationID) {
        navigator.accelerometer.clearWatch(watchAccelerationID);
        watchAccelerationID = null;
    }
}

function getCurrentAcceleration() {
	var accelerometer = document.getElementById('accelerometer');
	try {
		accelerometer.style.display = 'block';
		navigator.accelerometer.getCurrentAcceleration(onAccelerationSuccess, onAccelerationError, { frequency: 5000 });
	} catch(e) {
		alert(e.message);
	}
}


function toggleStartAcceleration(em) {
	try {
		var accelerometer = document.getElementById('accelerometer');
		if(em.value == "Accelerometer.watchAcceleration") {
			em.value = "Accelerometer.clearWatch";
			accelerometer.style.display = 'block';
			startWatchAcceleration();
		} else {
			em.value = "Accelerometer.watchAcceleration";
			accelerometer.style.display = 'none';
			stopWatchAcceleration();
		}
	}
	catch(e) {
		alert(e.message);
	}
}
// Utility Function
function debugPrint(body) {
    var list = document.getElementById("debuglist");
    var item = document.createElement("li");
    item.appendChild(document.createTextNode(body));
    list.appendChild(item);
}

// Stock Browser Test (Any URL request launches Stock browser) 
function launchExternalBrowser() {
  window.location = "http://cordova.io";
}


// Network
function hostIsReachable() {
  try {
    var network = document.getElementById('network');
    var callback = function(reachability) {
      console.log(reachability);
      var networkState = reachability.code;
      var http_code = reachability.http_code;
      var states = [];
      states[NetworkStatus.NOT_REACHABLE]                      = 'No network connection';
      states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
      states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK]         = 'WiFi connection';
      network.style.display = 'block';
      network.innerHTML = 'Code: '+reachability.code+' Connection type: '+states[networkState];
    }
    navigator.network.isReachable("http://cordova.io", callback, {});
  } catch(e) {
    debugPrint("hostIsReachable(): "+e.message);
  }
}

// System
function getSystemInfo() {
  try {
    var system = document.getElementById("system");
    system.style.display = "block";
    system.innerHTML = 'Device Name: '     + device.name     + '<br />' + 
                       'Device Cordova: '  + device.cordova + '<br />' + 
                       'Device Platform: ' + device.platform + '<br />' + 
                       'Device UUID: '     + device.uuid     + '<br />' + 
                       'Device Version: '  + device.version  + '<br />';
  } catch(e) {
    debugPrint("Error Occured: "+e.message);
  }
  
}

// DebugConsole 
function Log() {
  var log_statement = document.getElementById("log_statement").value;
  console.log(log_statement); 
  console.warn(log_statement); 
  console.error(log_statement); 
  console.log({test:'pouet', test2:['pouet1', 'pouet2']});
}

// Contacts
function createContact() {
  var myContact = navigator.service.contacts.create({displayName: "Test User"});
  myContact.gender = "male";
  console.log("The contact, "+myContact.displayName + ", is of the "+myContact.gender +" gender");
}

function saveContact() {
  try {
    var onSuccess = function(result) {
      debugPrint("Save Success: "+result.message);
    };
    var onError = function(contactError) {
      debugPrint("Error = "+contactError.code);
    };
    var contact = navigator.service.contacts.create();
    contact.name = new ContactName();
    contact.name.familyName = "Doe";
    contact.name.givenName = "John";
    contact.displayName = "John Doe";
    contact.nickname = "Plumber";
    contact.phoneNumbers = [new ContactField("Mobile", "6047894567"), new ContactField("Home", "7789989674"), new ContactField("Other", "7789989673")];
    contact.emails = [new ContactField("Personal", "nomail@noset.com"), new ContactField("Work", "nomail2@noset.com"), new ContactField("Other", "nomail3@noset.com")];
    contact.urls = [new ContactField("Work", "http://www.domain.com"), new ContactField("Personal", "http://www.domain2.com")];
    contact.organization = new ContactOrganization();
    contact.organization.name = "Nitobi Software Inc";
    contact.organization.title = "Software Engineer";
    contact.birthday = new Date();
    contact.address = new ContactAddress();
    contact.address.streetAddress = "200 Abbott Street";
    contact.address.locality = "Vancouver";
    contact.address.region = "BC";
    contact.address.postalCode = "V6Z2X6";
    contact.address.country = "Canada";
    contact.save(onSuccess, onError);
  } catch(e) {
    debugPrint("Error Occured: "+e.message);
  }
}

function findContact() {
  try {
    var onSuccess = function(contacts) {
      debugPrint("Found "+contacts.length+" contacts.");
//      var contacts = navigator.service.contacts.results;
//      var contactStr = "IDs found: "
//      for(i in contacts) {
//        contactStr += contacts[i].id + " ";
//      }
//      debugPrint(contactStr);
    };
    var onFailure = function() {
      debugPrint("ERROR");
    };
    navigator.service.contacts.find(["displayName", "firstName"], onSuccess, onFailure, {filter:"7789989674"});
  } catch(e) {
    debugPrint("Error Occured: "+e.message);
  }
}

function removeContacts() {
  try {
    var onSuccess = function(result) {
      debugPrint(result.message);
    };
    var onFailure = function(result) {
      debugPrint("ERROR in Removing Contact: "+result.message);
    };
    var toRemove = navigator.service.contacts.results;
    while(toRemove.length > 0) {
      var contact = toRemove.shift();
      contact.remove(onSuccess, onFailure);
    }
  } catch(e) {
    debugPrint("Error Occured in remove Contact: "+e.message);
  }
}

// Compass
var watchCompassId = null;

function startWatchCompass() {
  var options = { frequency: 3000 };
  var onSuccess = function(compass) {
      var element = document.getElementById('compass');
      element.innerHTML = 'Compass X: ' + compass.x + '<br />' +
                          'Compass Y: ' + compass.y + '<br />' +
                          'Compass Z: ' + compass.z + '<br />' +
                          'Timestamp: '      + compass.timestamp + '<br />';
  };

  var onFail = function() {
      debugPrint('Compass Error!');
  };
  watchCompassId = navigator.compass.watchHeading(onSuccess, onFail, options);
}

function stopWatchCompass() {
    try {
      navigator.compass.clearWatch(watchCompassId);
      watchCompassId= null;
    } catch(e) {
      debugPrint("stopWatchCompass: "+e.message);
    }
}

function getCurrentHeading() {
	try {
    var compass = document.getElementById('compass');
    var onSuccess = function(compass) {
        var element = document.getElementById('compass');
        element.innerHTML = 'Compass X: ' + compass.x + '<br />' +
                            'Compass Y: ' + compass.y + '<br />' +
                            'Compass Z: ' + compass.z + '<br />' +
                            'Timestamp: ' + compass.timestamp + '<br />';
    }

    var onFail = function() {
        debugPrint('Compass Error!');
    }
		compass.style.display = 'block';
		navigator.compass.getCurrentHeading(onSuccess, onFail, { frequency: 5000 });
	} catch(e) {
		alert(e.message);
	}
}


function toggleStartCompass(em) {
	try {
		var compass = document.getElementById('compass');
		if(em.value == "Compass.watchHeading") {
			em.value = "Compass.clearWatch";
			compass.style.display = 'block';
			startWatchCompass();
		} else {
			em.value = "Compass.watchHeading";
			compass.style.display = 'none';
			stopWatchCompass();
		}
	}
	catch(e) {
		alert(e.message);
	}
}

// Notification

function notificationAlert() {
  var complete = function(button) {
    debugPrint("Alert button clicked: "+button);
  }
  try {
    navigator.notification.alert("This is an alert Dialog",complete, "Alert Title", "OK");
  } catch(e) {
    debugPrint(e.message);
  }
}

function notificationConfirm() {
  var complete = function(button) {
    debugPrint("Alert button clicked: "+button);
  }
  try {
    navigator.notification.confirm("This is an alert Dialog",complete, "Alert Title", "OK,Cancel");
  } catch(e) {
    debugPrint(e.message);
  }
}

function notificationVibrate() {
  try {
    navigator.notification.vibrate(3000);
  } catch(e) {
    debugPrint(e.message);
  }
}
function notificationBeep() {
  try {
    navigator.notification.beep(4);
  } catch(e) {
    debugPrint(e.message);
  }
}

// Camera

function getPicture() {
  try {
    var successCallback = function(uri) {
      var image = document.getElementById("picture");
      debugPrint(uri);
      image.src = uri;
    }
    var errorCallback = function(message) {
      debugPrint("Camera Failed: "+message);
    }
    navigator.camera.getPicture(successCallback, errorCallback, {});
  } catch(e) {
    debugPring(e.message);
  }
}
