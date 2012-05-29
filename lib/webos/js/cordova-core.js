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

if (typeof(DeviceInfo) != 'object')
    DeviceInfo = {};

function Cordova() {
	ready = true;
	available = true;
	sceneController = null;	
}; 


Cordova.exec = function(win, fail, clazz, action, args) {

 setTimeout(function() { 
	 Cordova.plugins[clazz].execute(action, args, win, fail); 
   }, 0);

}

Cordova.checkArgs = function(args, func) {
    if (typeof args == 'object')
        func.apply(null, args);
    else
        func(args);
}

Cordova.callback = function(success, win, fail) {
	if (success)
		win();
	else
		fail();    
}

// translates the action into an API call
accelerometerAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'setFastAccelerometer':				
				Cordova.checkArgs(args, navigator.accelerometer.setFastAccelerometer);    
				actionFound = true; 
				break;
			case 'getCurrentAcceleration':
				Cordova.checkArgs(args, navigator.accelerometer.getCurrentAcceleration);
				actionFound = true;
				break;	
			case 'watchAcceleration':
			    Cordova.checkArgs(args, navigator.accelerometer.watchAcceleration);
			    actionFound = true;
			    break;
			case 'clearWatch':
			    Cordova.checkArgs(args, navigator.accelerometer.clearWatch);
			    actionFound = true;
			    break;
			case 'start':
			    Cordova.checkArgs(args, navigator.accelerometer.start);
			    actionFound = true;
			    break;      		
		}

        Cordova.callback(actionFound, win, fail);
    }
}

applicationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'activate':				
				Cordova.checkArgs(args, navigator.application.activate);    
				actionFound = true; 
				break;
			case 'deactivate':
				Cordova.checkArgs(args, navigator.application.deactivate);
				actionFound = true;
				break;	
			case 'getIdentifier':
			    Cordova.checkArgs(args, navigator.application.getIdentifier);
			    actionFound = true;
			    break;      		
		}

		Cordova.callback(actionFound, win, fail);       
    }
}

cameraAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getPicture':
				console.log("in here");
				Cordova.checkArgs(args, navigator.camera.getPicture);    
				actionFound = true; 
				break;      		
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

// translates the action into an API call
compassAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getCurrentHeading':
				Cordova.checkArgs(args, navigator.compass.getCurrentHeading);
				actionFound = true;
				break;	
			case 'watchHeading':
			    Cordova.checkArgs(args, navigator.compass.watchHeading);
			    actionFound = true;
			    break;
			case 'clearWatch':
			    Cordova.checkArgs(args, navigator.compass.clearWatch);
			    actionFound = true;
			    break;
			case 'start':
			    Cordova.checkArgs(args, navigator.compass.start);
			    actionFound = true;
			    break;      		
		}

        Cordova.callback(actionFound, win, fail);
    }
}

debugAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'log':				
				Cordova.checkArgs(args, window.debug.log);    
				actionFound = true; 
				break;
		    case 'warn':
			    Cordova.checkArgs(args, window.debug.warn);    
			    actionFound = true; 
			    break;		    
		    case 'error':
			    Cordova.checkArgs(args, window.debug.error);    
			    actionFound = true; 
			    break;		          		
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

deviceAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getDeviceInfo':				
				Cordova.checkArgs(args, navigator.device.getDeviceInfo);    
				actionFound = true; 
				break;		          		
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

geolocationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getCurrentPosition':				
				Cordova.checkArgs(args, navigator.geolocation.getCurrentPosition);    
				actionFound = true; 
				break; 
			case 'watchPosition':				
				Cordova.checkArgs(args, navigator.geolocation.watchPosition);    
				actionFound = true; 
				break;
			case 'clearWatch':
			    Cordova.checkArgs(args, navigator.geolocation.clearWatch);    
			    actionFound = true; 
			    break;
			case 'start':
			    Cordova.checkArgs(args, navigator.geolocation.start);    
			    actionFound = true; 
			    break;
			case 'stop':
			    Cordova.checkArgs(args, navigator.geolocation.stop);    
			    actionFound = true; 
			    break;								   	          		
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

mapAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'show':				
				Cordova.checkArgs(args, navigator.map.show);    
				actionFound = true; 
				break;		          		
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

mouseAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'simulateMouseClick':				
				Cordova.checkArgs(args, navigator.mouse.simulateMouseClick);    
				actionFound = true; 
				break;		          		
		}

		Cordova.callback(actionFound, win, fail);        
    }
} 

networkAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'isReachable':				
				Cordova.checkArgs(args, navigator.network.isReachable);    
				actionFound = true; 
				break;		          		
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

notificationAPI = {
    execute: function(action, args, win, fail) {
		var actionFound = false;
		switch(action) {
			case 'alert':				
				Cordova.checkArgs(args, navigator.notification.alert);    
				actionFound = true; 
				break;
			case 'showBanner':
				Cordova.checkArgs(args, navigator.notification.showBanner);
				actionFound = true;
				break;	
			case 'newDashboard':
			    Cordova.checkArgs(args, navigator.notification.newDashboard);
			    actionFound = true;
			    break;
			case 'removeBannerMessage':
			    Cordova.checkArgs(args, navigator.notification.removeBannerMessage);
			    actionFound = true;
			    break;
			case 'clearBannerMessage':
			    Cordova.checkArgs(args, navigator.notification.clearBannerMessage);
			    actionFound = true;
			    break;
			case 'vibrate':            
			    Cordova.checkArgs(args, navigator.notification.vibrate);
			    actionFound = true;
			    break;
			case 'beep':               
			    Cordova.checkArgs(args, navigator.notification.beep);
			    actionFound = true;
			    break;       		
		}

		Cordova.callback(actionFound, win, fail);
   }
}

orientationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'setOrientation':				
				Cordova.checkArgs(args, navigator.orientation.setOrientation);    
				actionFound = true; 
				break;
			case 'getOrientation':
			    Cordova.checkArgs(args, navigator.orientation.getOrientation);    
			    actionFound = true; 
			    break;			    
			case 'start':
			    Cordova.checkArgs(args, navigator.orientation.start);    
				actionFound = true; 
				break;
			case 'watchOrientation':
			    Cordova.checkArgs(args, navigator.orientation.watchOrientation);    
				actionFound = true; 
				break;
			case 'clearWatch':
                Cordova.checkArgs(args, navigator.orientation.clearWatch);    
			    actionFound = true; 
			    break;
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

smsAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'send':				
				Cordova.checkArgs(args, navigator.sms.send);    
				actionFound = true; 
				break;		          		
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

telephonyAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'send':				
				Cordova.checkArgs(args, navigator.telephony.send);    
				actionFound = true; 
				break;		          		
		}

		Cordova.callback(actionFound, win, fail);        
    }
}

windowAPI = {
    execute: function(action, args, win, fail) {
   		var actionFound = false;
   		switch(action) {
   			case 'newCard':
   			    Cordova.checkArgs(args, navigator.window.newCard);  				    
   				actionFound = true; 
   				break;
   			case 'setFullScreen':
   			  	Cordova.checkArgs(args, navigator.window.setFullScreen);
   				actionFound = true; 
   				break;
   			case 'setWindowProperties':
   			    Cordova.checkArgs(args, navigator.window.setWindowProperties);
		        actionFound = true;
		        break;   			
   			case 'blockScreenTimeout':
   			    Cordova.checkArgs(args, navigator.window.blockScreenTimeout);
   			    actionFound = true;
		        break;
   			case 'setSubtleLightbar':
   			    Cordova.checkArgs(args, navigator.window.setSubtleLightbar);
   			    actionFound = true;
   			    break;
   				   			  	
   		}

   		Cordova.callback(actionFound, win, fail);
      }    
}

// this mapping acts as a shim to the webOS APIs
Cordova.plugins = {};
Cordova.plugins['navigator.accelerometer'] = accelerometerAPI;
Cordova.plugins['navigator.application'] = applicationAPI;
Cordova.plugins['navigator.camera'] = cameraAPI;
Cordova.plugins['navigator.compass'] = compassAPI;
Cordova.plugins['window.debug'] = debugAPI;
Cordova.plugins['navigator.device'] = deviceAPI;
Cordova.plugins['navigator.geolocation'] = geolocationAPI;
Cordova.plugins['navigator.map'] = mapAPI;
Cordova.plugins['navigator.mouse'] = mouseAPI;
Cordova.plugins['navigator.network'] = networkAPI; 
Cordova.plugins['navigator.notification'] = notificationAPI;
Cordova.plugins['navigator.orientation'] = orientationAPI; 
Cordova.plugins['navigator.sms'] = smsAPI;
Cordova.plugins['navigator.telephony'] = telephonyAPI;  
Cordova.plugins['navigator.window'] = windowAPI;

document.addEventListener('DOMContentLoaded', function () {
    window.cordova = new Cordova();
    navigator.device.deviceReady();
});
