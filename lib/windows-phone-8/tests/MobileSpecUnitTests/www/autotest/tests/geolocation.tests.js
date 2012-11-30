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

    describe('getCurrentPosition method', function() {
        describe('error callback', function() {
            it("should be called if we set timeout to 0 and maximumAge to a very small number", function() {
                console.log("Here I am");
                var win = jasmine.createSpy(),
                    fail = jasmine.createSpy();

                runs(function () {
                    navigator.geolocation.getCurrentPosition(win, fail, {
                        maximumAge: 0,
                        timeout: 0
                    });
                });

                waitsFor(function () { return fail.wasCalled; }, "fail never called", 250); //small timeout as this should fire very fast

                runs(function () {
                    expect(win).not.toHaveBeenCalled();
                });
            });
        });

        describe('success callback', function() {
            it("should be called with a Position object", function() {
                var win = jasmine.createSpy().andCallFake(function(p) {
                          expect(p.coords).toBeDefined();
                          expect(p.timestamp).toBeDefined();
                      }),
                      fail = jasmine.createSpy();

                runs(function () {
                    navigator.geolocation.getCurrentPosition(win, fail, {
                        maximumAge:300000 // 5 minutes maximum age of cached position
                    });
                });

                waitsFor(function () { return win.wasCalled; }, "win never called", 20000);

                runs(function () {
                    expect(fail).not.toHaveBeenCalled();
                });
            });
        });
    });

    describe('watchPosition method', function() {
        describe('error callback', function() {
            var errorWatch = null;

            afterEach(function() {
                navigator.geolocation.clearWatch(errorWatch);
            });
            it("should be called if we set timeout to 0 and maximumAge to a very small number", function() {
                var win = jasmine.createSpy(),
                    fail = jasmine.createSpy();

                runs(function () {
                    errorWatch = navigator.geolocation.watchPosition(win, fail, {
                        maximumAge: 0,
                        timeout: 0
                    });
                });

                waitsFor(function () { return fail.wasCalled; }, "fail never called", 250); // small timeout as this hsould fire very quickly

                runs(function () {
                    expect(win).not.toHaveBeenCalled();
                });
            });
        });

        describe('success callback', function() {
            var successWatch = null;

            afterEach(function() {
                navigator.geolocation.clearWatch(successWatch);
            });
            it("should be called with a Position object", function() {
                var win = jasmine.createSpy().andCallFake(function(p) {
                          expect(p.coords).toBeDefined();
                          expect(p.timestamp).toBeDefined();
                      }),
                      fail = jasmine.createSpy();

                runs(function () {
                    successWatch = navigator.geolocation.watchPosition(win, fail, {
                        maximumAge:(5 * 60 * 1000) // 5 minutes maximum age of cached position
                    });
                });

                waitsFor(function () { return win.wasCalled; }, "win never called", 20000);

                runs(function () {
                    expect(fail).not.toHaveBeenCalled();
                });
            });
        });
    });
});
