Tests.prototype.PlatformTests = function() {	
    module('Platform (cordova)');
    test("should exist", function() {
        expect(1);
        ok(typeof cordova != 'undefined' && cordova != null, "cordova should not be null.");
    });
    module('Platform (Cordova)');
    test("should not exist", function() {
        expect(1);
        ok(typeof Cordova == 'undefined', "Cordova should be null.");
    });
    module('Platform (PhoneGap)');
    test("should exist", function() {
        expect(1);
        ok(typeof PhoneGap != 'undefined' && PhoneGap != null, "PhoneGap should not be null.");
    });
    test("exec method should exist", function() {
        expect(2);
        ok(typeof PhoneGap.exec != 'undefined' && PhoneGap.exec != null, "PhoneGap.exec should not be null.");
        ok(typeof PhoneGap.exec == 'function', "PhoneGap.exec should be a function.");
    });
    test("addPlugin method should exist", function() {
        expect(2);
        ok(typeof PhoneGap.addPlugin != 'undefined' && PhoneGap.addPlugin != null, "PhoneGap.addPlugin should not be null.");
        ok(typeof PhoneGap.addPlugin == 'function', "PhoneGap.addPlugin should be a function.");
    });
    test("addConstructor method should exist", function() {
        expect(2);
        ok(typeof PhoneGap.addConstructor != 'undefined' && PhoneGap.addConstructor != null, "PhoneGap.addConstructor should not be null.");
        ok(typeof PhoneGap.addConstructor == 'function', "PhoneGap.addConstructor should be a function.");
    });
    module('Platform (window.plugins)');
    test("should exist", function() {
        expect(1);
        ok(typeof window.plugins != 'undefined' && window.plugins != null, "window.plugins should not be null.");
    });
};