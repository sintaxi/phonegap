if (typeof(DeviceInfo) != 'object')
    DeviceInfo = {};

function PhoneGap() {
	ready = true;
	available = true;
	sceneController = null;	
}; 

PhoneGap.exec = function(win, fail, clazz, action, args) {

 setTimeout(function() { 
	 PhoneGap.plugins[clazz].execute(action, args, win, fail); 
   }, 0);

}

PhoneGap.checkArgs = function(args, func) {
    if (typeof args == 'object')
        func.apply(null, args);
    else
        func(args);
}

PhoneGap.callback = function(success, win, fail) {
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
				PhoneGap.checkArgs(args, navigator.accelerometer.setFastAccelerometer);    
				actionFound = true; 
				break;
			case 'getCurrentAcceleration':
				PhoneGap.checkArgs(args, navigator.accelerometer.getCurrentAcceleration);
				actionFound = true;
				break;	
			case 'watchAcceleration':
			    PhoneGap.checkArgs(args, navigator.accelerometer.watchAcceleration);
			    actionFound = true;
			    break;
			case 'clearWatch':
			    PhoneGap.checkArgs(args, navigator.accelerometer.clearWatch);
			    actionFound = true;
			    break;
			case 'start':
			    PhoneGap.checkArgs(args, navigator.accelerometer.start);
			    actionFound = true;
			    break;      		
		}

        PhoneGap.callback(actionFound, win, fail);
    }
}

applicationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'activate':				
				PhoneGap.checkArgs(args, navigator.application.activate);    
				actionFound = true; 
				break;
			case 'deactivate':
				PhoneGap.checkArgs(args, navigator.application.deactivate);
				actionFound = true;
				break;	
			case 'getIdentifier':
			    PhoneGap.checkArgs(args, navigator.application.getIdentifier);
			    actionFound = true;
			    break;      		
		}

		PhoneGap.callback(actionFound, win, fail);       
    }
}

cameraAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getPicture':
				console.log("in here");
				PhoneGap.checkArgs(args, navigator.camera.getPicture);    
				actionFound = true; 
				break;      		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

debugAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'log':				
				PhoneGap.checkArgs(args, window.debug.log);    
				actionFound = true; 
				break;
		    case 'warn':
			    PhoneGap.checkArgs(args, window.debug.warn);    
			    actionFound = true; 
			    break;		    
		    case 'error':
			    PhoneGap.checkArgs(args, window.debug.error);    
			    actionFound = true; 
			    break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

deviceAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getDeviceInfo':				
				PhoneGap.checkArgs(args, navigator.device.getDeviceInfo);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

geolocationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'getCurrentPosition':				
				PhoneGap.checkArgs(args, navigator.geolocation.getCurrentPosition);    
				actionFound = true; 
				break; 
			case 'watchPosition':				
				PhoneGap.checkArgs(args, navigator.geolocation.watchPosition);    
				actionFound = true; 
				break;
			case 'clearWatch':
			    PhoneGap.checkArgs(args, navigator.geolocation.clearWatch);    
			    actionFound = true; 
			    break;
			case 'start':
			    PhoneGap.checkArgs(args, navigator.geolocation.start);    
			    actionFound = true; 
			    break;
			case 'stop':
			    PhoneGap.checkArgs(args, navigator.geolocation.stop);    
			    actionFound = true; 
			    break;								   	          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

mapAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'show':				
				PhoneGap.checkArgs(args, navigator.map.show);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

mouseAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'simulateMouseClick':				
				PhoneGap.checkArgs(args, navigator.mouse.simulateMouseClick);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
} 

networkAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'isReachable':				
				PhoneGap.checkArgs(args, navigator.network.isReachable);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

notificationAPI = {
    execute: function(action, args, win, fail) {
		var actionFound = false;
		switch(action) {
			case 'alert':				
				PhoneGap.checkArgs(args, navigator.notification.alert);    
				actionFound = true; 
				break;
			case 'showBanner':
				PhoneGap.checkArgs(args, navigator.notification.showBanner);
				actionFound = true;
				break;	
			case 'newDashboard':
			    PhoneGap.checkArgs(args, navigator.notification.newDashboard);
			    actionFound = true;
			    break;
			case 'removeBannerMessage':
			    PhoneGap.checkArgs(args, navigator.notification.removeBannerMessage);
			    actionFound = true;
			    break;
			case 'clearBannerMessage':
			    PhoneGap.checkArgs(args, navigator.notification.clearBannerMessage);
			    actionFound = true;
			    break;
			case 'vibrate':            
			    PhoneGap.checkArgs(args, navigator.notification.vibrate);
			    actionFound = true;
			    break;
			case 'beep':               
			    PhoneGap.checkArgs(args, navigator.notification.beep);
			    actionFound = true;
			    break;       		
		}

		PhoneGap.callback(actionFound, win, fail);
   }
}

orientationAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'setOrientation':				
				PhoneGap.checkArgs(args, navigator.orientation.setOrientation);    
				actionFound = true; 
				break;
			case 'getOrientation':
			    PhoneGap.checkArgs(args, navigator.orientation.getOrientation);    
			    actionFound = true; 
			    break;			    
			case 'start':
			    PhoneGap.checkArgs(args, navigator.orientation.start);    
				actionFound = true; 
				break;
			case 'watchOrientation':
			    PhoneGap.checkArgs(args, navigator.orientation.watchOrientation);    
				actionFound = true; 
				break;
			case 'clearWatch':
                PhoneGap.checkArgs(args, navigator.orientation.clearWatch);    
			    actionFound = true; 
			    break;
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

smsAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'send':				
				PhoneGap.checkArgs(args, navigator.sms.send);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

telephonyAPI = {
    execute: function(action, args, win, fail) {
        var actionFound = false;
		switch(action) {
			case 'send':				
				PhoneGap.checkArgs(args, navigator.telephony.send);    
				actionFound = true; 
				break;		          		
		}

		PhoneGap.callback(actionFound, win, fail);        
    }
}

windowAPI = {
    execute: function(action, args, win, fail) {
   		var actionFound = false;
   		switch(action) {
   			case 'newCard':
   			    PhoneGap.checkArgs(args, navigator.window.newCard);  				    
   				actionFound = true; 
   				break;
   			case 'setFullScreen':
   			  	PhoneGap.checkArgs(args, navigator.window.setFullScreen);
   				actionFound = true; 
   				break;
   			case 'setWindowProperties':
   			    PhoneGap.checkArgs(args, navigator.window.setWindowProperties);
		        actionFound = true;
		        break;   			
   			case 'blockScreenTimeout':
   			    PhoneGap.checkArgs(args, navigator.window.blockScreenTimeout);
   			    actionFound = true;
		        break;
   			case 'setSubtleLightbar':
   			    PhoneGap.checkArgs(args, navigator.window.setSubtleLightbar);
   			    actionFound = true;
   			    break;
   				   			  	
   		}

   		PhoneGap.callback(actionFound, win, fail);
      }    
}

// this mapping acts as a shim to the webOS APIs
PhoneGap.plugins = {};
PhoneGap.plugins['navigator.accelerometer'] = accelerometerAPI;
PhoneGap.plugins['navigator.application'] = applicationAPI;
PhoneGap.plugins['navigator.camera'] = cameraAPI;
PhoneGap.plugins['window.debug'] = debugAPI;
PhoneGap.plugins['navigator.device'] = deviceAPI;
PhoneGap.plugins['navigator.geolocation'] = geolocationAPI;
PhoneGap.plugins['navigator.map'] = mapAPI;
PhoneGap.plugins['navigator.mouse'] = mouseAPI;
PhoneGap.plugins['navigator.network'] = networkAPI; 
PhoneGap.plugins['navigator.notification'] = notificationAPI;
PhoneGap.plugins['navigator.orientation'] = orientationAPI; 
PhoneGap.plugins['navigator.sms'] = smsAPI;
PhoneGap.plugins['navigator.telephony'] = telephonyAPI;  
PhoneGap.plugins['navigator.window'] = windowAPI;


document.addEventListener('DOMContentLoaded', function () {
    window.phonegap = new PhoneGap();
    navigator.device.deviceReady();
});
