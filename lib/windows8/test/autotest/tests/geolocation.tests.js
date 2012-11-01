describe('Geolocation (navigator.geolocation)', function () {
	it("should exist", function() {
        expect(navigator.geolocation).toBeDefined();
	});

	it("should contain a getCurrentPosition function", function() {
		expect(typeof navigator.geolocation.getCurrentPosition).toBeDefined();
		expect(typeof navigator.geolocation.getCurrentPosition == 'function').toBe(true);
	});

	it("should contain a watchPosition function", function() {
		expect(typeof navigator.geolocation.watchPosition).toBeDefined();
		expect(typeof navigator.geolocation.watchPosition == 'function').toBe(true);
	});

	it("should contain a clearWatch function", function() {
		expect(typeof navigator.geolocation.clearWatch).toBeDefined();
		expect(typeof navigator.geolocation.clearWatch == 'function').toBe(true);
	});

	it("getCurrentPosition success callback should be called with a Position object", function() {
		var win = jasmine.createSpy().andCallFake(function(a) {
                expect(a.coords).not.toBe(null);
                expect(a.timestamp).not.toBe(null);
            }),
            fail = jasmine.createSpy();

        runs(function () {
            navigator.geolocation.getCurrentPosition(win, fail, {
                maximumAge:300000 // 5 minutes maximum age of cached position
            });
        });

        waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

        runs(function () {
            expect(fail).not.toHaveBeenCalled();
        });
	});

	it("getCurrentPosition success callback should be called with a cached Position", function() {
	    var win = jasmine.createSpy().andCallFake(function (a) {
	        if (a instanceof Position) {
	            expect(a instanceof Position).toBe(true);
            } else {
                expect(a.toString() === '[object Position]').toBe(true);
            }
               
            }),
            fail = jasmine.createSpy();

        runs(function () {
            navigator.geolocation.getCurrentPosition(win, fail, {
                maximumAge:300000 // 5 minutes 
            });
        });

        waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

        runs(function () {
            expect(fail).not.toHaveBeenCalled();
        });
	});

    it("getCurrentPosition error callback should be called if we set timeout to 0 and maximumAge to a very small number", function() {
        var win = jasmine.createSpy(),
            fail = jasmine.createSpy();

        runs(function () {
            navigator.geolocation.getCurrentPosition(win, fail, {
                maximumAge: 0,
                timeout: 0
            });
        });

        waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

        runs(function () {
            expect(win).not.toHaveBeenCalled();
        });
    });

    // TODO: Need to test error callback... how?
        // You could close your geolocation capability and expect the error code to be 3.(already tested in Win8 Implementation) 
	// TODO: Need to test watchPosition success callback, test that makes sure clearPosition works (how to test that a timer is getting cleared?)
    describe("Geolocation model", function () {
        it("should be able to define a Position object with coords and timestamp properties", function() {
            var pos = new Position({}, new Date());
            expect(pos).toBeDefined();
            expect(pos.coords).toBeDefined();
            expect(pos.timestamp).toBeDefined();
        });

        it("should be able to define a Coordinates object with latitude, longitude, accuracy, altitude, heading, speed and altitudeAccuracy properties", function() {
            var coords = new Coordinates(1,2,3,4,5,6,7);
            expect(coords).toBeDefined();
            expect(coords.latitude).toBeDefined();
            expect(coords.longitude).toBeDefined();
            expect(coords.accuracy).toBeDefined();
            expect(coords.altitude).toBeDefined();
            expect(coords.heading).toBeDefined();
            expect(coords.speed).toBeDefined();
            expect(coords.altitudeAccuracy).toBeDefined();
        });
    });
});
