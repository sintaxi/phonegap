describe('Compass (navigator.compass)', function () {
    it("should exist", function() {
        expect(navigator.compass).toBeDefined();
    });

    it("should contain a getCurrentHeading function", function() {
        expect(navigator.compass.getCurrentHeading).toBeDefined();
		expect(typeof navigator.compass.getCurrentHeading == 'function').toBe(true);
	});

    it("getCurrentHeading success callback should be called with a Heading object", function() {
        var win = jasmine.createSpy().andCallFake(function(a) {
                expect(a instanceof CompassHeading).toBe(true);
                expect(a.magneticHeading).toBeDefined();
                expect(typeof a.magneticHeading == 'number').toBe(true);
                expect(a.trueHeading).not.toBe(undefined);
                expect(typeof a.trueHeading == 'number' || a.trueHeading === null).toBe(true);
                expect(a.headingAccuracy).not.toBe(undefined);
                expect(typeof a.headingAccuracy == 'number' || a.headingAccuracy === null).toBe(true);
                expect(typeof a.timestamp == 'number').toBe(true);
            }),
            fail = jasmine.createSpy();

        runs(function () {
            navigator.compass.getCurrentHeading(win, fail);
        });

        waitsFor(function () { return win.wasCalled; }, "success callback never called", Tests.TEST_TIMEOUT);

        runs(function () {
            expect(fail).not.toHaveBeenCalled();
            expect(win).toHaveBeenCalled();
        });
	});

    it("should contain a watchHeading function", function() {
        expect(navigator.compass.watchHeading).toBeDefined();
        expect(typeof navigator.compass.watchHeading == 'function').toBe(true);
    });

    it("should contain a clearWatch function", function() {
        expect(navigator.compass.clearWatch).toBeDefined();
        expect(typeof navigator.compass.clearWatch == 'function').toBe(true);
    });

    describe('Compass Constants (window.CompassError)', function () {
        it("should exist", function() {
            expect(window.CompassError).toBeDefined();
            expect(window.CompassError.COMPASS_INTERNAL_ERR).toBe(0);
            expect(window.CompassError.COMPASS_NOT_SUPPORTED).toBe(20);
        });
    });

    describe('Compass Heading model (CompassHeading)', function () {
        it("should exist", function() {
            expect(CompassHeading).toBeDefined();
        });

        it("should be able to create a new CompassHeading instance with no parameters", function() {
            var h = new CompassHeading();
            expect(h.magneticHeading).toBeDefined();
            expect(h.trueHeading).toBeDefined();
            expect(h.headingAccuracy).toBeDefined();
            expect(typeof h.timestamp == 'number').toBe(true);
        });

        it("should be able to creat a new CompassHeading instance with parameters", function() {
            var h = new CompassHeading(1,2,3,4);
            expect(h.magneticHeading).toBe(1);
            expect(h.trueHeading).toBe(2);
            expect(h.headingAccuracy).toBe(3);
            expect(h.timestamp.valueOf()).toBe(4);
            expect(typeof h.timestamp == 'number').toBe(true);
        });
    });
});
