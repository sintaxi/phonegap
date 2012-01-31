Tests.prototype.SMSTests = function() {	
	module('SMS (navigator.sms)');
	test("should exist", function() {
  		expect(1);
  		ok(navigator.sms != null, "navigator.sms should not be null.");
	});
	test("should contain a send function", function() {
		expect(2);
		ok(typeof navigator.sms.send != 'undefined' && navigator.sms.send != null, "navigator.sms.send should not be null.");
		ok(typeof navigator.sms.send == 'function', "navigator.sms.send should be a function.");
	});
};