Tests.prototype.BatteryTests = function() {  
    module('Battery (navigator.battery)');
    test("should exist", function() {
        expect(1);
        ok(navigator.battery != null, "navigator.battery should not be null.");
    });
};
