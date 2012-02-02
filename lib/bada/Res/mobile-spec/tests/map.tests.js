Tests.prototype.MapTests = function() {	
	module('Map (navigator.map)');
	test("should exist", function() {
  		expect(1);
  		ok(navigator.map != null, "navigator.map should not be null.");
	});
	test("should contain a show function", function() {
		expect(2);
		ok(navigator.map.show != null, "navigator.map.show should not be null.");
		ok(typeof navigator.map.show == 'function', "navigator.map.show should be a function.");
	});
};