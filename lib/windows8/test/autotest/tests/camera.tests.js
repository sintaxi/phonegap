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

describe('Test getPicture function', function () {
    it("should retrieve a base64 data when DestinationType equals DATA_URL", function () {
        var onPhotoDataSuccess = jasmine.createSpy().andCallFake(function (imageData) {
            var image = new Image();
            image.src = "data:image/jpeg;base64," + imageData;
            
        })
        var onFail = jasmine.createSpy().andCallFake(function (message) {
            console.log(message);
        })

        runs(function () {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, destinationType: navigator.camera.DestinationType.DATA_URL, saveToPhotoAlbum: true, targetHeight: 600, targetWidth: 800 });
        });

        waitsFor(function () { return onPhotoDataSuccess.wasCalled; }, "Insert callback never called", 30000);

        runs(function () {
            expect(onPhotoDataSuccess).toHaveBeenCalled();
            expect(onFail).not.toHaveBeenCalled();
        })
    })

    it("should retrieve a URI when DestinationType equals FILE_URL", function () {
        var onPhotoDataSuccess = jasmine.createSpy().andCallFake(function (imageURI) {
            var image = new Image();
            image.src = imageURI;
            //console.log("src=" + image.src);
            expect(String(image.src).substr(0, 3)).toBe("ms-");
        })
        var onFail = jasmine.createSpy().andCallFake(function (message) {
            console.log(message);
        })

        runs(function () {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, saveToPhotoAlbum: true, targetHeight: 600, targetWidth: 800 });
        });

        waitsFor(function () { return onPhotoDataSuccess.wasCalled; }, "Insert callback never called", 30000);

        runs(function () {
            expect(onPhotoDataSuccess).toHaveBeenCalled();
            expect(onFail).not.toHaveBeenCalled();
        })
    })
    it("should retrieve a jpg when PictureSourceType equals PHOTOLIBRARY", function () {
        var onPhotoDataSuccess = jasmine.createSpy().andCallFake(function (imageURI) {
            //expect(String(imageURI).substr(0, 3)).toBe('C:\\');
            var image = new Image();
            image.src = imageURI;
            console.log("src=" + image.src);
            expect(String(image.src).substr(0, 3)).toBe("ms-");
        })
        var onFail = jasmine.createSpy().andCallFake(function (message) {
            console.log(message);
        })

        runs(function () {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY, targetWidth: 200, targetHeight: 150 });
        });

        waitsFor(function () { return onPhotoDataSuccess.wasCalled; }, "Insert callback never called", 30000);

        runs(function () {
            expect(onPhotoDataSuccess).toHaveBeenCalled();
            expect(onFail).not.toHaveBeenCalled();
        })
    })

    it("should retrieve a png when EncodingType equals PNG", function () {
        var onPhotoDataSuccess = jasmine.createSpy().andCallFake(function (imageURI) {
            var extensionArr = String(imageURI).split(".");
            expect(extensionArr[extensionArr.length - 1]).toBe('png');
        })
        var onFail = jasmine.createSpy().andCallFake(function (message) {
            console.log(message);
        })

        runs(function () {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, saveToPhotoAlbum: true, encodingType: navigator.camera.EncodingType.PNG, targetWidth: 200, targetHeight: 150 });
        });

        waitsFor(function () { return onPhotoDataSuccess.wasCalled; }, "Insert callback never called", 30000);

        runs(function () {
            expect(onPhotoDataSuccess).toHaveBeenCalled();
            expect(onFail).not.toHaveBeenCalled();
        })
    })

    
    it("should retrieve nothing when mediaType is Video from photolibrary.(You must keep your photolibrary only to contain image files) ", function () {
        var onPhotoDataSuccess = jasmine.createSpy().andCallFake(function (imageURI) {
            var image = new Image();
            image.src = imageURI;
            //console.log("src=" + image.src);
            expect(String(image.src).substr(0, 3)).toBe("ms-");
        })
        var onFail = jasmine.createSpy().andCallFake(function (message) {
            expect(message).toBe("User didn't choose a file.");
        })

        runs(function () {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, saveToPhotoAlbum: true, encodingType: navigator.camera.EncodingType.PNG, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY, mediaType: navigator.camera.MediaType.VIDEO});
        })

        waitsFor(function () { return onFail.wasCalled; }, "Insert callback never called", 10000);

        runs(function () {
            expect(onPhotoDataSuccess).not.toHaveBeenCalled();
            expect(onFail).toHaveBeenCalled();
        })
    })

    it("should retrieve a specific pixels when targetWidth or targetHeight is given.", function () {
        var onPhotoDataSuccess = jasmine.createSpy().andCallFake(function (imageURI) {
            // Todo: get the real pixels of the picture instead of finding it in the directory
            var image = new Image();
            image.src = imageURI;
            
            image.onload = function () {
                console.log(image.height);
                expect(image.width).toBe(1280);
            }
            
        })
        var onFail = jasmine.createSpy().andCallFake(function (message) {
            console.log(message);
        })

        runs(function () {
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, saveToPhotoAlbum: true, targetWidth: 1280, targetHeight: 960});
        });

        waitsFor(function () { return onPhotoDataSuccess.wasCalled; }, "Insert callback never called", 30000);

        runs(function () {
            expect(onPhotoDataSuccess).toHaveBeenCalled();
            expect(onFail).not.toHaveBeenCalled();
        })
    })

});