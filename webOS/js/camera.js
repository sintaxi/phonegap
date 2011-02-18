/*
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	
};

/*
 * 
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {
  params = { sublaunch: true };
  
  if (typeof options != 'undefined' && typeof options.filename != 'undefined') {
    params.filename = options.filename;
  }
  
  navigator.camera.errorCallback = errorCallback;
  navigator.camera.successCallback = successCallback;
  
	//TODO: This callback is not being called
	//currently calling handlePicture from First-assistant.js activate method
	var that = this;
	this.callback = function (event) { 
		if (event !== undefined) {
			debug.log(Object.toJSON(event));
			Mojo.Event.stopListening(PhoneGap.sceneController.sceneElement, Mojo.Event.activate, that.callback);
			
			// TODO: not receiving the proper event object as per forum article
			//successCallback(event.filename);
		}
	};
	
	Mojo.Event.listen(PhoneGap.sceneController.sceneElement, Mojo.Event.activate, this.callback);
	
	PhoneGap.sceneController.stageController.pushScene(
		{ 
			appId :'com.palm.app.camera', 
			name: 'capture'
		}, params
	);
};

if (typeof navigator.camera == 'undefined') navigator.camera = new Camera();

