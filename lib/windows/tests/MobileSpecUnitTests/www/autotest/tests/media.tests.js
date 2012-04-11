Tests.prototype.MediaTests = function() {	
	module('Media');
	test("should exist", function() {
  		expect(1);
		ok(typeof Media === "function" || typeof Media === "object", "'Media' should be defined as a function in global scope.");
	});
    test("should have the following properties", function() {
        var media1 = new Media("dummy");
        expect(4);
        ok(typeof media1.id != 'undefined' && media1.id != null, "'Media' should have an id property.");
        ok(typeof media1.src != 'undefined', "'Media' should have an src property.");
        ok(typeof media1._duration != 'undefined' && media1._duration != null, "'Media' should have an _duration property.");
        ok(typeof media1._position != 'undefined' && media1._position != null, "'Media' should have an _position property.");
        media1.release();
    });
	test("should define constants for Media errors", function() {
		expect(6);
		ok(MediaError != null && typeof MediaError != 'undefined', "MediaError object exists in global scope.");
        equals(MediaError.MEDIA_ERR_NONE_ACTIVE, 0, "MediaError.MEDIA_ERR_NONE_ACTIVE is equal to 0.");
        equals(MediaError.MEDIA_ERR_ABORTED, 1, "MediaError.MEDIA_ERR_ABORTED is equal to 1.");
		equals(MediaError.MEDIA_ERR_NETWORK, 2, "MediaError.MEDIA_ERR_NETWORK is equal to 2.");
		equals(MediaError.MEDIA_ERR_DECODE, 3, "MediaError.MEDIA_ERR_DECODE is equal to 3.");
		equals(MediaError.MEDIA_ERR_NONE_SUPPORTED, 4, "MediaError.MEDIA_ERR_NONE_SUPPORTED is equal to 4.");
	});
    test("should contain a play function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.play != 'undefined' && media1.play != null, "Media.play should not be null.");
        ok(typeof media1.play == 'function', "Media.play should be a function.");
        media1.release();
    });
    test("should contain a stop function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.stop != 'undefined' && media1.stop != null, "Media.stop should not be null.");
        ok(typeof media1.stop == 'function', "Media.stop should be a function.");
        media1.release();
    });
    test("should contain a seekTo function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.seekTo != 'undefined' && media1.seekTo != null, "Media.seekTo should not be null.");
        ok(typeof media1.seekTo == 'function', "Media.seekTo should be a function.");
        media1.release();
    });
    test("should contain a pause function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.pause != 'undefined' && media1.pause != null, "Media.pause should not be null.");
        ok(typeof media1.pause == 'function', "Media.pause should be a function.");
        media1.release();
    });
    test("should contain a getDuration function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.getDuration != 'undefined' && media1.getDuration != null, "Media.getDuration should not be null.");
        ok(typeof media1.getDuration == 'function', "Media.getDuration should be a function.");
        media1.release();
    });
    test("should contain a getCurrentPosition function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.getCurrentPosition != 'undefined' && media1.getCurrentPosition != null, "Media.getCurrentPosition should not be null.");
        ok(typeof media1.getCurrentPosition == 'function', "Media.getCurrentPosition should be a function.");
        media1.release();
    });
    test("should contain a startRecord function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.startRecord != 'undefined' && media1.startRecord != null, "Media.startRecord should not be null.");
        ok(typeof media1.startRecord == 'function', "Media.startRecord should be a function.");
        media1.release();
    });
    test("should contain a stopRecord function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.stopRecord != 'undefined' && media1.stopRecord != null, "Media.stopRecord should not be null.");
        ok(typeof media1.stopRecord == 'function', "Media.stopRecord should be a function.");
        media1.release();
    });
    test("should contain a release function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.release != 'undefined' && media1.release != null, "Media.release should not be null.");
        ok(typeof media1.release == 'function', "Media.release should be a function.");
        media1.release();
    });
    test("should contain a setVolume function", function() {
        var media1 = new Media();
        expect(2);
        ok(typeof media1.setVolume != 'undefined' && media1.setVolume != null, "Media.setVolume should not be null.");
        ok(typeof media1.setVolume == 'function', "Media.setVolume should be a function.");
        media1.release();
    });
	test("should return MediaError for bad filename", function() {
		expect(2);
		QUnit.stop(10000);
		var badMedia = null;
		var releaseMedia = function() {
			badMedia.release();
		};
		var win = function() {
			ok(0, "should NOT succeed with bad media file name");
			releaseMedia();
			QUnit.start();
		};
		var fail = function(result){
			ok(typeof result == 'object', "Object returned in media.play failure callback is of type 'object' (actually MediaError).");
			ok(result.code == MediaError.MEDIA_ERR_ABORTED, "Object returned in media.find failure callback has a code property which equal to MediaError.MEDIA_ERR_ABORTED");
			releaseMedia();
			QUnit.start(); 
		};
		badMedia = new Media("invalid.file.name", win,fail);
		badMedia.play();
	});
    test("position should be set properly", function() {
        var media1 = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3");
        media1.play();
        expect(1);
        QUnit.stop(15000);
        setTimeout(
                function() {
                    media1.getCurrentPosition(
                        function(position) {
                            console.log("position = " + position);
                            ok(position >= 0.0, "position should not be -1");
                            QUnit.start();
                            media1.stop()
                            media1.release();
                        },
                        function(e) {
                            QUnit.start();
                        }
                    );
                }
           , 5000);
    });
    test("duration should be set properly", function() {
        var media1 = new Media("http://audio.ibeat.org/content/p1rj1s/p1rj1s_-_rockGuitar.mp3");
        media1.play();
        expect(1);
        QUnit.stop(15000);
        setTimeout(
                function() {
                    ok(media1.getDuration() >= 0.0, "duration should not be -1");
                    QUnit.start();
                    media1.stop()
                    media1.release();
                }
           , 5000);
    });
};