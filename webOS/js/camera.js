/*
 * This class provides access to the device camera.
 * @constructor
 */
function Camera() {
	
};

/*
 * @param {Function} successCallback
 * @param {Function} errorCallback
 * @param {Object} options
 */
Camera.prototype.getPicture = function(successCallback, errorCallback, options) {

	var filename = "";

	if (typeof options != 'undefined' && typeof options.filename != 'undefined') {
		filename = options.filename;
	}	

	this.service = navigator.service.Request('palm://com.palm.applicationManager', {
		method: 'launch',
		parameters: {
		id: 'com.palm.app.camera',
		params: {
				appId: 'com.palm.app.camera',
				name: 'capture',
				sublaunch: true,
				filename: filename
			}
		},
		onSuccess: successCallback,
		onFailure: errorCallback
	});	
};

if (typeof navigator.camera == 'undefined') navigator.camera = new Camera();

