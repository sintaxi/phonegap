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
});
