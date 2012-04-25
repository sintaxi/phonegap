describe('Accelerometer (navigator.accelerometer)', function () {
	it("should exist", function () {
        expect(navigator.accelerometer).toBeDefined();
	});

	it("should contain a getCurrentAcceleration function", function() {
		expect(typeof navigator.accelerometer.getCurrentAcceleration).toBeDefined();
		expect(typeof navigator.accelerometer.getCurrentAcceleration == 'function').toBe(true);
	});

	it("getCurrentAcceleration success callback should be called with an Acceleration object", function() {

		var win = jasmine.createSpy().andCallFake(function(a) {
                expect(a).toBeDefined();
                expect(a.x).toBeDefined();
                expect(typeof a.x == 'number').toBe(true);
                expect(a.y).toBeDefined();
                expect(typeof a.y == 'number').toBe(true);
                expect(a.z).toBeDefined();
                expect(typeof a.z == 'number').toBe(true);
            }),
            fail = jasmine.createSpy();

        runs(function () {
		    navigator.accelerometer.getCurrentAcceleration(win, fail);
        });

        waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

        runs(function () {
            expect(fail).not.toHaveBeenCalled();
        });
	});

	it("should contain a watchAcceleration function", function() {
		expect(navigator.accelerometer.watchAcceleration).toBeDefined();
		expect(typeof navigator.accelerometer.watchAcceleration == 'function').toBe(true);
	});

	it("should contain a clearWatch function", function() {
		expect(navigator.accelerometer.clearWatch).toBeDefined();
		expect(typeof navigator.accelerometer.clearWatch == 'function').toBe(true);
	});

	describe('Acceleration model', function () { 
        it("should be able to define a new Acceleration object with x, y, z and timestamp properties.", function () {
            var x = 1;
            var y = 2;
            var z = 3;
            var a = new Acceleration(x, y, z);
            expect(a).toBeDefined();
            expect(a.x).toBe(x);
            expect(a.y).toBe(y);
            expect(a.z).toBe(z);
            expect(a.timestamp).toBeDefined();
        });
    });
});
