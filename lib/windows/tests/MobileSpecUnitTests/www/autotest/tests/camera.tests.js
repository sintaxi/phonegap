Tests.prototype.CameraTests = function() {	
	module('Camera (navigator.camera)');
	test("should exist", function() {
      expect(1);
      ok(navigator.camera !== null, "navigator.camera should not be null.");
	});
	test("should contain a getPicture function", function() {
		expect(2);
		ok(typeof navigator.camera.getPicture != 'undefined' && navigator.camera.getPicture !== null, "navigator.camera.getPicture should not be null.");
		ok(typeof navigator.camera.getPicture == 'function', "navigator.camera.getPicture should be a function.");
	});

  module('Camera Constants (window.Camera + navigator.camera)');
  test("window.Camera should exist", function() {
    expect(1);
    ok(window.Camera !== null, "window.Camera should not be null.");
  });
  test("should contain two DestinationType constants", function() {
    expect(4);
    equals(Camera.DestinationType.DATA_URL, 0, "Camera.DestinationType.DATA_URL should equal to 0");
    equals(Camera.DestinationType.FILE_URI, 1, "Camera.DestinationType.DATA_URL should equal to 1");
    equals(navigator.camera.DestinationType.DATA_URL, 0, "navigator.camera.DestinationType.DATA_URL should equal to 0");
    equals(navigator.camera.DestinationType.FILE_URI, 1, "navigator.camera.DestinationType.DATA_URL should equal to 1");
  });
  test("should contain two EncodingType constants", function() {
    expect(4);
    equals(Camera.EncodingType.JPEG, 0, "Camera.EncodingType.JPEG should equal to 0");
    equals(Camera.EncodingType.PNG, 1, "Camera.EncodingType.PNG should equal to 1");
    equals(navigator.camera.EncodingType.JPEG, 0, "navigator.camera.EncodingType.JPEG should equal to 0");
    equals(navigator.camera.EncodingType.PNG, 1, "navigator.camera.EncodingType.PNG should equal to 1");
  });
  test("should contain three MediaType constants", function() {
    expect(6);
    equals(Camera.MediaType.PICTURE, 0, 'Camera.MediaType.PICTURE should equal to 0');
    equals(Camera.MediaType.VIDEO, 1, 'Camera.MediaType.VIDEO should equal to 1');
    equals(Camera.MediaType.ALLMEDIA, 2, 'Camera.MediaType.ALLMEDIA should equal to 2');
    equals(navigator.camera.MediaType.PICTURE, 0, 'navigator.camera.MediaType.PICTURE should equal to 0');
    equals(navigator.camera.MediaType.VIDEO, 1, 'navigator.camera.MediaType.VIDEO should equal to 1');
    equals(navigator.camera.MediaType.ALLMEDIA, 2, 'navigator.camera.MediaType.ALLMEDIA should equal to 2');
  });
  test("should contain three PictureSourceType constants", function() {
    expect(6);
    equals(Camera.PictureSourceType.PHOTOLIBRARY, 0, 'Camera.PictureSourceType.PHOTOLIBRARY should equal to 0');
    equals(Camera.PictureSourceType.CAMERA, 1, 'Camera.PictureSourceType.CAMERA should equal to 1');
    equals(Camera.PictureSourceType.SAVEDPHOTOALBUM, 2, 'Camera.PictureSourceType.SAVEDPHOTOALBUM should equal to 2');
    equals(navigator.camera.PictureSourceType.PHOTOLIBRARY, 0, 'navigator.camera.PictureSourceType.PHOTOLIBRARY should equal to 0');
    equals(navigator.camera.PictureSourceType.CAMERA, 1, 'navigator.camera.PictureSourceType.CAMERA should equal to 1');
    equals(navigator.camera.PictureSourceType.SAVEDPHOTOALBUM, 2, 'navigator.camera.PictureSourceType.SAVEDPHOTOALBUM should equal to 2');
  });
};
