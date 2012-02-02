Tests.prototype.CameraTests = function() {	
	module('Camera (navigator.camera)');
	test("should exist", function() {
  		expect(1);
  		ok(navigator.camera != null, "navigator.camera should not be null.");
	});
	test("should contain a getPicture function", function() {
		expect(2);
		ok(typeof navigator.camera.getPicture != 'undefined' && navigator.camera.getPicture != null, "navigator.camera.getPicture should not be null.");
		ok(typeof navigator.camera.getPicture == 'function', "navigator.camera.getPicture should be a function.");
	});
};