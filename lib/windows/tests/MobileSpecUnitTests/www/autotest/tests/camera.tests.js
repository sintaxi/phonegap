describe('Camera (navigator.camera)', function () {
	it("should exist", function() {
        expect(navigator.camera).toBeDefined();
	});

	it("should contain a getPicture function", function() {
        expect(navigator.camera.getPicture).toBeDefined();
		expect(typeof navigator.camera.getPicture == 'function').toBe(true);
	});
});

describe('Camera Constants (window.Camera + navigator.camera)', function () {
    it("window.Camera should exist", function() {
        expect(window.Camera).toBeDefined();
    });

    it("should contain two DestinationType constants", function() {
        expect(Camera.DestinationType.DATA_URL).toBe(0);
        expect(Camera.DestinationType.FILE_URI).toBe(1);
        expect(navigator.camera.DestinationType.DATA_URL).toBe(0);
        expect(navigator.camera.DestinationType.FILE_URI).toBe(1);
    });

    it("should contain two EncodingType constants", function() {
        expect(Camera.EncodingType.JPEG).toBe(0);
        expect(Camera.EncodingType.PNG).toBe(1);
        expect(navigator.camera.EncodingType.JPEG).toBe(0);
        expect(navigator.camera.EncodingType.PNG).toBe(1);
    });

    it("should contain three MediaType constants", function() {
        expect(Camera.MediaType.PICTURE).toBe(0);
        expect(Camera.MediaType.VIDEO).toBe(1);
        expect(Camera.MediaType.ALLMEDIA).toBe(2);
        expect(navigator.camera.MediaType.PICTURE).toBe(0);
        expect(navigator.camera.MediaType.VIDEO).toBe(1);
        expect(navigator.camera.MediaType.ALLMEDIA).toBe(2);
    });
    it("should contain three PictureSourceType constants", function() {
        expect(Camera.PictureSourceType.PHOTOLIBRARY).toBe(0);
        expect(Camera.PictureSourceType.CAMERA).toBe(1);
        expect(Camera.PictureSourceType.SAVEDPHOTOALBUM).toBe(2);
        expect(navigator.camera.PictureSourceType.PHOTOLIBRARY).toBe(0);
        expect(navigator.camera.PictureSourceType.CAMERA).toBe(1);
        expect(navigator.camera.PictureSourceType.SAVEDPHOTOALBUM).toBe(2);
    });
});
