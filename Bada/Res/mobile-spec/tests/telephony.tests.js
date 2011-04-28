Tests.prototype.TelephonyTests = function() {	
	module('Telephony (navigator.telephony)');
	test("should exist", function() {
  		expect(1);
  		ok(navigator.telephony != null, "navigator.telephony should not be null.");
	});
	test("should contain a send function", function() {
		expect(2);
		ok(typeof navigator.telephony.send != 'undefined' && navigator.telephony.send != null, "navigator.telephony.send should not be null.");
		ok(typeof navigator.telephony.send == 'function', "navigator.telephony.send should be a function.");
	});
};