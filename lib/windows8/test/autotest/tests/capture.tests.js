describe('Capture (navigator.device.capture)', function () {
    it("should exist", function() {
        expect(navigator.device).toBeDefined();
        expect(navigator.device.capture).toBeDefined();
    });

    it("should have the correct properties ", function() {
        expect(navigator.device.capture.supportedAudioModes).toBeDefined();
        expect(navigator.device.capture.supportedImageModes).toBeDefined();
        expect(navigator.device.capture.supportedVideoModes).toBeDefined();
    });

    it("should contain a captureAudio function", function() {
        expect(navigator.device.capture.captureAudio).toBeDefined();
        expect(typeof navigator.device.capture.captureAudio == 'function').toBe(true);
    });

    it("should contain a captureImage function", function() {
        expect(navigator.device.capture.captureImage).toBeDefined();
        expect(typeof navigator.device.capture.captureImage == 'function').toBe(true);
    });

    it("should contain a captureVideo function", function() {
        expect(navigator.device.capture.captureVideo).toBeDefined();
        expect(typeof navigator.device.capture.captureVideo == 'function').toBe(true);
    });

    describe('CaptureAudioOptions', function () {
        it("CaptureAudioOptions constructor should exist", function() {
            var options = new CaptureAudioOptions();
            expect(options).toBeDefined();
            expect(options.limit).toBeDefined();
            expect(options.duration).toBeDefined();
            expect(options.mode).toBeDefined();
        });
    });

    describe('CaptureImageOptions', function () {
        it("CaptureImageOptions constructor should exist", function() {
            var options = new CaptureImageOptions();
            expect(options).toBeDefined();
            expect(options.limit).toBeDefined();
            expect(options.mode).toBeDefined();
        });
    });

    describe('CaptureVideoOptions', function () {
        it("CaptureVideoOptions constructor should exist", function() {
            var options = new CaptureVideoOptions();
            expect(options).toBeDefined();
            expect(options.limit).toBeDefined();
            expect(options.duration).toBeDefined();
            expect(options.mode).toBeDefined();
        });
    });

    describe('CaptureError interface', function () {
        it("CaptureError constants should be defined", function() {
            expect(CaptureError.CAPTURE_INTERNAL_ERR).toBe(0);
            expect(CaptureError.CAPTURE_APPLICATION_BUSY).toBe(1);
            expect(CaptureError.CAPTURE_INVALID_ARGUMENT).toBe(2);
            expect(CaptureError.CAPTURE_NO_MEDIA_FILES).toBe(3);
        });

        it("CaptureError properties should exist", function() {
            var error = new CaptureError();
            expect(error).toBeDefined();
            expect(error.code).toBeDefined();
        });
    });

    describe('MediaFileData', function () {
        it("MediaFileData constructor should exist", function() {
            var fileData = new MediaFileData();
            expect(fileData).toBeDefined();
            expect(fileData.bitrate).toBeDefined();
            expect(fileData.codecs).toBeDefined();
            expect(fileData.duration).toBeDefined();
            expect(fileData.height).toBeDefined();
            expect(fileData.width).toBeDefined();
        });
    });

    describe('MediaFile', function () {
        it("MediaFile constructor should exist", function() {
            var fileData = new MediaFile();
            expect(fileData).toBeDefined();
            expect(fileData.name).toBeDefined();
            expect(fileData.fullPath).toBeDefined();
            expect(fileData.type).toBeDefined();
            expect(fileData.lastModifiedDate).toBeDefined();
            expect(fileData.size).toBeDefined();
        });
    });

    describe('Test captureAudio function', function () {
        it("should capture a audio when the function invoked (w/ duration).", function () {
            var captureSuccess = jasmine.createSpy().andCallFake(function (mediaFiles) {
                expect(mediaFiles[0].fullPath.substr(0, 3)).toBe("C:\\");
                // TODO: Check the recording result by yourself.
                //console.log(mediaFiles.fullPath);
            })
            var captureError = jasmine.createSpy().andCallFake(function (error) {
                console.log("code:" + error.code);
            })
            runs(function () {
                navigator.device.capture.captureAudio(captureSuccess , captureError , {duration:10});
            });

            waitsFor(function () { return captureSuccess.wasCalled; }, "captureSuccess callback never called", 30000);

            runs(function () {
                expect(captureSuccess).toHaveBeenCalled();
                expect(captureError).not.toHaveBeenCalled();
            })
        });
    });

    describe('Test captureVideo function', function () {
        it("should capture a video when the function invoked (w/ duration).", function () {
            var captureSuccess = jasmine.createSpy().andCallFake(function (mediaFiles) {
                expect(mediaFiles[0].fullPath.substr(0, 3)).toBe("C:\\");
                // TODO: Check the video by yourself.
                //console.log(mediaFiles.fullPath);
            })
            var captureError = jasmine.createSpy().andCallFake(function (error) {
                console.log("code:" + error.code);
            })
            runs(function () {
                navigator.device.capture.captureVideo(captureSuccess, captureError, { duration: 10 });
            });

            waitsFor(function () { return captureSuccess.wasCalled; }, "captureSuccess callback never called", 70000);

            runs(function () {
                expect(captureSuccess).toHaveBeenCalled();
                expect(captureError).not.toHaveBeenCalled();
            })
        });
    });

    describe('Test captureImage function', function () {
        it("should capture a image when the function invoked.", function () {
            var captureSuccess = jasmine.createSpy().andCallFake(function (mediaFiles) {
                expect(mediaFiles[0].fullPath.substr(0, 3)).toBe("C:\\");
                // TODO: Check the video by yourself.
                //console.log(mediaFiles.fullPath);
            })
            var captureError = jasmine.createSpy().andCallFake(function (error) {
                console.log("code:" + error.code);
            })
            runs(function () {
                navigator.device.capture.captureImage(captureSuccess, captureError);
            });

            waitsFor(function () { return captureSuccess.wasCalled; }, "captureSuccess callback never called", 70000);

            runs(function () {
                expect(captureSuccess).toHaveBeenCalled();
                expect(captureError).not.toHaveBeenCalled();
            })
        });
    });

    describe('Test getFormatData function', function () {
        it("should get format data about image.", function () {
            var success = jasmine.createSpy().andCallFake(function (mediaFileData) {
                console.dir(mediaFileData);
                expect(mediaFileData.codecs).toBeDefined();
                expect(mediaFileData.bitrate).toBe(0);
                expect(mediaFileData.height).toBeDefined();
                expect(mediaFileData.width).toBeDefined();
                expect(mediaFileData.duration).toBe(0);
            })
            var fail = jasmine.createSpy().andCallFake(function (error) {})
            var captureSuccess = jasmine.createSpy().andCallFake(function (mediaFiles) {
                runs(function () {
                    
                    mediaFiles.getFormatData(success, fail);
                });
                waitsFor(function () { return success.wasCalled; }, "success callback never called", 7500);
            })
            var captureError = jasmine.createSpy().andCallFake(function (error) {
                console.log("code:" + error.code);
            })
            runs(function () {
                navigator.device.capture.captureImage(captureSuccess, captureError);
            });

            waitsFor(function () { return captureSuccess.wasCalled; }, "captureSuccess callback never called", 70000);

            runs(function () {
                expect(captureSuccess).toHaveBeenCalled();
                expect(captureError).not.toHaveBeenCalled();
            })
        });

        it("should get format data about video.", function () {
            var success = jasmine.createSpy().andCallFake(function (mediaFileData) {
                console.dir(mediaFileData);
                expect(mediaFileData.codecs).toBeDefined();
                expect(mediaFileData.bitrate).toBeDefined();
                expect(mediaFileData.height).toBeDefined();
                expect(mediaFileData.width).toBeDefined();
                expect(mediaFileData.duration).toBeDefined();
            })
            var fail = jasmine.createSpy().andCallFake(function (error) { })
            var captureSuccess = jasmine.createSpy().andCallFake(function (mediaFiles) {
                runs(function () {

                    mediaFiles.getFormatData(success, fail);
                });
                waitsFor(function () { return success.wasCalled; }, "success callback never called", 7500);
            })
            var captureError = jasmine.createSpy().andCallFake(function (error) {
                console.log("code:" + error.code);
            })
            runs(function () {
                navigator.device.capture.captureVideo(captureSuccess, captureError, { duration: 10 });
            });

            waitsFor(function () { return captureSuccess.wasCalled; }, "captureSuccess callback never called", 70000);

            runs(function () {
                expect(captureSuccess).toHaveBeenCalled();
                expect(captureError).not.toHaveBeenCalled();
            })
        });

        it("should get format data about audio.", function () {
            var success = jasmine.createSpy().andCallFake(function (mediaFileData) {
                console.dir(mediaFileData);
                expect(mediaFileData.codecs).toBeDefined();
                expect(mediaFileData.bitrate).toBeDefined();
                expect(mediaFileData.height).toBe(0);
                expect(mediaFileData.width).toBe(0);
                expect(mediaFileData.duration).toBeDefined();
            })
            var fail = jasmine.createSpy().andCallFake(function (error) { })
            var captureSuccess = jasmine.createSpy().andCallFake(function (mediaFiles) {
                runs(function () {

                    mediaFiles.getFormatData(success, fail);
                });
                waitsFor(function () { return success.wasCalled; }, "success callback never called", 7500);
            })
            var captureError = jasmine.createSpy().andCallFake(function (error) {
                console.log("code:" + error.code);
            })
            runs(function () {
                navigator.device.capture.captureAudio(captureSuccess, captureError, { duration: 10 });
            });

            waitsFor(function () { return captureSuccess.wasCalled; }, "captureSuccess callback never called", 70000);

            runs(function () {
                expect(captureSuccess).toHaveBeenCalled();
                expect(captureError).not.toHaveBeenCalled();
            })
        });
    });
});
