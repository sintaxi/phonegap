describe('Platform (cordova)', function () {
    it("should exist", function() {
        expect(cordova).toBeDefined();
    });
    describe('Platform (Cordova)', function () {
        it("should exist", function() {
            expect(window.Cordova).toBeDefined();
        });
    });
    describe('Platform (PhoneGap)', function () {
        it("should exist", function() {
            expect(PhoneGap).toBeDefined();
        });

        it("exec method should exist", function() {
            expect(PhoneGap.exec).toBeDefined();
            expect(typeof PhoneGap.exec).toBe('function');
        });

        it("addPlugin method should exist", function() {
            expect(PhoneGap.addPlugin).toBeDefined();
            expect(typeof PhoneGap.addPlugin).toBe('function');
        });

        it("addConstructor method should exist", function() {
            expect(PhoneGap.addConstructor).toBeDefined();
            expect(typeof PhoneGap.addConstructor).toBe('function');
        });
    });
    describe('Platform (window.plugins)', function () {
        it("should exist", function() {
            expect(window.plugins).toBeDefined();
        });
    });
});
