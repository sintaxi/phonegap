//
// @TODO Update to Latest HTML5 Audio Element Spec
// @see http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html#audio
//
Tests.prototype.MediaTests = function () {
    module('Media (Audio)');

    var srcLocalMediaFile = "test.wav";
    var srcNetworkMediaFile = "http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3";

    var srcDummyFile = "some link to media file";
    var media = new Media(srcDummyFile, null, null);

    test("should exist", function () {
        expect(1);
        ok(typeof Audio === "function" || typeof Audio === "object", "'Audio' should be defined as a function in global scope.");
    });
    test("should define constants for Media errors", function () {
        expect(9);
        ok(MediaError != null && typeof MediaError != 'undefined', "MediaError object exists in global scope.");
        equals(MediaError.MEDIA_ERR_PLAY_MODE_SET, 1, "MediaError.MEDIA_ERR_PLAY_MODE_SET is equal to 1.");
        equals(MediaError.MEDIA_ERR_ALREADY_RECORDING, 2, "MediaError.MEDIA_ERR_ALREADY_RECORDING is equal to 2.");
        equals(MediaError.MEDIA_ERR_STARTING_RECORDING, 3, "MediaError.MEDIA_ERR_STARTING_RECORDING is equal to 3.");
        equals(MediaError.MEDIA_ERR_RECORD_MODE_SET, 4, "MediaError.MEDIA_ERR_RECORD_MODE_SET is equal to 4.");
        equals(MediaError.MEDIA_ERR_STARTING_PLAYBACK, 5, "MediaError.MEDIA_ERR_STARTING_PLAYBACK is equal to 5.");
        equals(MediaError.MEDIA_ERR_RESUME_STATE, 6, "MediaError.MEDIA_ERR_DECODE is equal to 6.");
        equals(MediaError.MEDIA_ERR_PAUSE_STATE, 7, "MediaError.MEDIA_ERR_PAUSE_STATE is equal to 7.");
        equals(MediaError.MEDIA_ERR_STOP_STATE, 8, "MediaError.MEDIA_ERR_STOP_STATE is equal to 8.");
    });

    test("should contain 'src', 'loop' and 'error' properties", function () {
        expect(7);
        var audioSrc = '/test.mp3';
        var audio = new Audio(audioSrc);
        ok(typeof audio == "object", "Instantiated 'Audio' object instance should be of type 'object.'");
        ok(audio.src != null && typeof audio.src != 'undefined', "Instantiated 'Audio' object's 'src' property should not be null or undefined.");
        ok(audio.src.indexOf(audioSrc) >= 0, "Instantiated 'Audio' object's 'src' property should match constructor parameter.");
        ok(audio.loop != null && typeof audio.loop != 'undefined', "Instantiated 'Audio' object's 'loop' property should not be null or undefined.");
        ok(audio.loop == false, "Instantiated 'Audio' object's 'loop' property should initially be false.");
        ok(typeof audio.error != 'undefined', "Instantiated 'Audio' object's 'error' property should not undefined.");
        ok(audio.error == null, "Instantiated 'Audio' object's 'error' should initially be null.");
    });

    test("Media constructor should exist", function () {
        expect(1);
        ok(media != null, "media1 should not be null.");
    });

    test("should contain an play function", function () {
        expect(2);
        ok(typeof media.play != 'undefined' && media.play != null, "media.play should not be null.");
        ok(typeof media.play == 'function', "media.play should be a function.");
    });

    test("should contain an pause function", function () {
        expect(2);
        ok(typeof media.pause != 'undefined' && media.pause != null, "media.pause should not be null.");
        ok(typeof media.pause == 'function', "media.pause should be a function.");
    });

    test("should contain an stop function", function () {
        expect(2);
        ok(typeof media.stop != 'undefined' && media.stop != null, "media.stop should not be null.");
        ok(typeof media.stop == 'function', "media.stop should be a function.");
    });

    test("should contain an seekTo function", function () {
        expect(2);
        ok(typeof media.seekTo != 'undefined' && media.seekTo != null, "media.seekTo should not be null.");
        ok(typeof media.seekTo == 'function', "media.seekTo should be a function.");
    });

    test("should contain an getDuration function", function () {
        expect(2);
        ok(typeof media.getDuration != 'undefined' && media.getDuration != null, "media.getDuration should not be null.");
        ok(typeof media.getDuration == 'function', "media.getDuration should be a function.");
    });

    test("should contain an getCurrentPosition function", function () {
        expect(2);
        ok(typeof media.getCurrentPosition != 'undefined' && media.getCurrentPosition != null, "media.getCurrentPosition should not be null.");
        ok(typeof media.getCurrentPosition == 'function', "media.getCurrentPosition should be a function.");
    });

    test("should contain an release function", function () {
        expect(2);
        ok(typeof media.release != 'undefined' && media.release != null, "media.release should not be null.");
        ok(typeof media.release == 'function', "media.release should be a function.");
    });

    test("should contain an startRecord function", function () {
        expect(2);
        ok(typeof media.startRecord != 'undefined' && media.startRecord != null, "media.startRecord should not be null.");
        ok(typeof media.startRecord == 'function', "media.startRecord should be a function.");
    });

    test("should contain an stopRecord function", function () {
        expect(2);
        ok(typeof media.stopRecord != 'undefined' && media.stopRecord != null, "media.stopRecord should not be null.");
        ok(typeof media.stopRecord == 'function', "media.stopRecord should be a function.");
    });

    test("should PhoneGap.Media.onStatus exist", function () {
        expect(1);
        ok(typeof PhoneGap.Media.onStatus === "function" || typeof PhoneGap.Media.onStatus === "object", "'Audio' should be defined as a function in global scope.");
    });
    
    test("record audio", function () {
        var media2 = new Media(srcLocalMediaFile,
                null,
                function (err) {
                    QUnit.start();
                },
                function (status) {
                    ok(status !== null, "status should not be null.");

                    if (typeof (media2.statusFlag) == 'undefined') {
                        equal(status, 2, "Should receive status MEDIA_RUNNING");
                        media2.statusFlag = true;

                        var recInterval = setInterval(function () {
                            clearInterval(recInterval);
                            media2.stopRecord();
                        }, 1000);

                    }
                    else {
                        equal(status, 4, "Should receive status MEDIA_STOPPED");
                        QUnit.start();
                    }
                });

        QUnit.stop(Tests.TEST_TIMEOUT);
        expect(4);
        media2.startRecord();

    });
   
    test("play file that doesn't exist", function () {

        var src = "wrongSrc";

        var media3 = new Media(src,
            null,
            function (err) {
                ok(err !== null, "error should not be null.");
                equal(err, MediaError.MEDIA_ERR_STARTING_PLAYBACK, "Should receive error code MEDIA_ERR_STARTING_PLAYBACK");
                QUnit.start();
            });

        QUnit.stop(Tests.TEST_TIMEOUT);
        expect(2);
        media3.play();
    });

    test("play internet audio", function () {
        var media2a = new Media(srcNetworkMediaFile,
                null,
                function (err) {
                    console.log("playAudio():Audio Error: " + err);
                    QUnit.start();
                },
                function (status) {
                    ok(status !== null, "status should not be null.");

                    if (typeof (media2a.statusFlag) == 'undefined') {
                        equal(status, 1, "Should receive status MEDIA_STARTING");
                        media2a.statusFlag = 1;

                    } else if (media2a.statusFlag === 1) {
                        equal(status, 2, "Should receive status MEDIA_RUNNING");
                        media2a.statusFlag = 2;
                        media2a.stop();
                    } else {
                        equal(status, 4, "Should receive status MEDIA_STOPPED");
                        QUnit.start();
                    }
                });

        QUnit.stop(10000);
        expect(6);
        media2a.play();

    });
};