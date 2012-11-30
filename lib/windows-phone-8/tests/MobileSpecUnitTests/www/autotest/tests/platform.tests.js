describe('Platform (cordova)', function () {
    it("should exist", function() {
        expect(cordova).toBeDefined();
    });

    it("exec method should exist", function() {
        expect(cordova.exec).toBeDefined();
        expect(typeof cordova.exec).toBe('function');
    });
});
