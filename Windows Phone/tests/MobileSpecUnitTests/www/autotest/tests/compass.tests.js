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
		expect(1);
		QUnit.stop(Tests.TEST_TIMEOUT);
		var win = function(a) 
		{
			ok(typeof a == 'string', "Compass heading object returned in getCurrentHeading success callback should be of type 'string'.");
			start();
		};
		var fail = function(a) 
		{ 
		    ok(typeof a == 'string', "Compass heading object returned in getCurrentHeading FAIL callback should be of type 'string'.");
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