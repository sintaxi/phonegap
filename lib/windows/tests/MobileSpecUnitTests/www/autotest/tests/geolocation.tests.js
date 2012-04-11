Tests.prototype.GeoLocationTests = function() {	
	module('Geolocation (navigator.geolocation)');
	test("should exist", function() {
  		expect(1);
  		ok(navigator.geolocation != null, "navigator.geolocation should not be null.");
	});
	test("should contain a getCurrentPosition function", function() {
		expect(2);
		ok(typeof navigator.geolocation.getCurrentPosition != 'undefined' && navigator.geolocation.getCurrentPosition != null, "navigator.geolocation.getCurrentPosition should not be null.");
		ok(typeof navigator.geolocation.getCurrentPosition == 'function', "navigator.geolocation.getCurrentPosition should be a function.");
	});
	test("should contain a watchPosition function", function() {
		expect(2);
		ok(typeof navigator.geolocation.watchPosition != 'undefined' && navigator.geolocation.watchPosition != null, "navigator.geolocation.watchPosition should not be null.");
		ok(typeof navigator.geolocation.watchPosition == 'function', "navigator.geolocation.watchPosition should be a function.");
	});
	test("should contain a clearWatch function", function() {
		expect(2);
		ok(typeof navigator.geolocation.clearWatch != 'undefined' && navigator.geolocation.clearWatch != null, "navigator.geolocation.watchPosition should not be null.");
		ok(typeof navigator.geolocation.clearWatch == 'function', "navigator.geolocation.clearWatch should be a function.");
	});
	test("getCurrentPosition success callback should be called with a Position object", function() {
		expect(2);
		QUnit.stop(15000);
		var win = function(p) {
			ok(p.coords != null, "Position object returned in getCurrentPosition success callback has a 'coords' property.");
			ok(p.timestamp != null, "Position object returned in getCurrentPosition success callback has a 'timestamp' property.");
			QUnit.start();
		};
		var fail = function() { 
        ok(false, "Error callback fired, test failed.");
        QUnit.start();
    };
		navigator.geolocation.getCurrentPosition(win, fail, {
        maximumAge:300000 // 5 minutes maximum age of cached position
    });
	});
  test("getCurrentPosition success callback should be called with a cached Position", function() {
    expect(1);
    QUnit.stop(Tests.TEST_TIMEOUT);
    var win = function(p) {
      ok(p.coords instanceof Position, "Position object returned is an instance of Position");
      QUnit.start();
    };
    var fail = function(e) {
      ok(false, "Error callback called, test failed.");
    };
    navigator.geolocation.getCurrentPosition(win, fail, {
        maximumAge:300000 // 5 minutes
    });
  });
  test("getCurrentPosition error callback should be called if we set timeout to 0 and maximumAge to a very small number", function() {
    expect(1);
    QUnit.stop(Tests.TEST_TIMEOUT);
    var win = function(p) {
      ok(false, "success callback called, test failed.");
      QUnit.start();
    };
    var fail = function(e) {
      ok(true, "error callback called");
      QUnit.start();
    };
    navigator.geolocation.getCurrentPosition(win, fail, {
        maximumAge: 0,
        timeout: 0
    });
  });
	// TODO: Need to test error callback... how?
	// TODO: Need to test watchPosition success callback, test that makes sure clearPosition works (how to test that a timer is getting cleared?)
	module('Geolocation model');
	test("should be able to define a Position object with coords and timestamp properties", function() {
		expect(3);
		var pos = new Position({}, new Date());
		ok(pos != null, "new Position() should not be null.");
		ok(typeof pos.coords != 'undefined' && pos.coords != null, "new Position() should include a 'coords' property.");
		ok(typeof pos.timestamp != 'undefined' && pos.timestamp != null, "new Position() should include a 'timestamp' property.");
	});
	test("should be able to define a Coordinates object with latitude, longitude, accuracy, altitude, heading, speed and altitudeAccuracy properties", function() {
		expect(8);
		var coords = new Coordinates(1,2,3,4,5,6,7);
		ok(coords != null, "new Coordinates() should not be null.");
		ok(typeof coords.latitude != 'undefined' && coords.latitude != null, "new Coordinates() should include a 'latitude' property.");
		ok(typeof coords.longitude != 'undefined' && coords.longitude != null, "new Coordinates() should include a 'longitude' property.");
		ok(typeof coords.accuracy != 'undefined' && coords.accuracy != null, "new Coordinates() should include a 'accuracy' property.");
		ok(typeof coords.altitude != 'undefined' && coords.altitude != null, "new Coordinates() should include a 'altitude' property.");
		ok(typeof coords.heading != 'undefined' && coords.heading != null, "new Coordinates() should include a 'heading' property.");
		ok(typeof coords.speed != 'undefined' && coords.speed != null, "new Coordinates() should include a 'speed' property.");
		ok(typeof coords.altitudeAccuracy != 'undefined' && coords.altitudeAccuracy != null, "new Coordinates() should include a 'altitudeAccuracy' property.");
	});
};
