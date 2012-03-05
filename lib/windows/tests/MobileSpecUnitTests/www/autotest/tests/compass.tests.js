Tests.prototype.CompassTests = function() 
{
	module('Compass (navigator.compass)');
	
	test("should exist", 
	function() {
  		expect(1);
  		ok(navigator.compass != null, "navigator.compass should not be null.");
	});
	
	test("should contain a getCurrentHeading function", 
	function() {
		expect(2);
		ok(typeof navigator.compass.getCurrentHeading != 'undefined' && navigator.compass.getCurrentHeading != null, "navigator.compass.getCurrentHeading should not be null.");
		ok(typeof navigator.compass.getCurrentHeading == 'function', "navigator.compass.getCurrentHeading should be a function.");
	});
	
	test("getCurrentHeading success callback should be called with an heading (string)", 
	function() {
		expect(9);
		QUnit.stop(Tests.TEST_TIMEOUT);
		var win = function(a) 
		{
			ok(typeof a == 'object', "Compass heading object returned in getCurrentHeading success callback should be of type 'Object'.");
			ok(a.magneticHeading != null, "Compass heading object has a magneticHeading property");
            ok(typeof a.magneticHeading == "number", "Compass heading.magneticHeading is a Number");

            ok(a.trueHeading != null, "Compass heading object has a magneticHeading property");
            ok(typeof a.trueHeading == "number", "Compass heading.trueHeading is a Number");

            ok(a.headingAccuracy != null, "Compass heading object has a magneticHeading property");
            ok(typeof a.headingAccuracy == "number", "Compass heading.headingAccuracy is a Number");

            ok(a.timestamp != null, "Compass heading object has a magneticHeading property");
            ok(typeof a.timestamp == "number", "Compass heading.timestamp is a Number");

            start();
		};
		var fail = function(a) 
		{ 
            ok(typeof a == 'object', "Compass heading object returned in getCurrentHeading FAIL callback should be of type 'object'.");
		    ok(a.code != null, "Compass error result should have a 'code' property");
            ok(typeof a.code == 'string', "Compass error result should have a 'code' property of type string");
			start(); 
		};
		navigator.compass.getCurrentHeading(win, fail);
	});
	
	test("should contain a watchHeading function", 
	function() {
		expect(2);
		ok(typeof navigator.compass.watchHeading != 'undefined' && navigator.compass.watchHeading != null, "navigator.compass.watchHeading should not be null.");
		ok(typeof navigator.compass.watchHeading == 'function', "navigator.compass.watchHeading should be a function.");
	});
	
	test("should contain a clearWatch function", function() 
	{
		expect(2);
		ok(typeof navigator.compass.clearWatch != 'undefined' && navigator.compass.clearWatch != null, "navigator.compass.clearWatch should not be null.");
		ok(typeof navigator.compass.clearWatch == 'function', "navigator.compass.clearWatch should be a function!");
	});
	
};