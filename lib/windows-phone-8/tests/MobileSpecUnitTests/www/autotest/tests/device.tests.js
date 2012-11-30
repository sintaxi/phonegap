describe('Device Information (window.device)', function () {
	it("should exist", function() {
        expect(window.device).toBeDefined();
	});

	it("should contain a platform specification that is a string", function() {
        expect(window.device.platform).toBeDefined();
		expect((new String(window.device.platform)).length > 0).toBe(true);
	});

	it("should contain a version specification that is a string", function() {
        expect(window.device.version).toBeDefined();
		expect((new String(window.device.version)).length > 0).toBe(true);
	});

	it("should contain a name specification that is a string", function() {
        expect(window.device.name).toBeDefined();
		expect((new String(window.device.name)).length > 0).toBe(true);
	});

	it("should contain a UUID specification that is a string or a number", function() {
        expect(window.device.uuid).toBeDefined();
		if (typeof window.device.uuid == 'string' || typeof window.device.uuid == 'object') {
		    expect((new String(window.device.uuid)).length > 0).toBe(true);
		} else {
			expect(window.device.uuid > 0).toBe(true);
		}
	});

	it("should contain a cordova specification that is a string", function() {
        expect(window.device.cordova).toBeDefined();
		expect((new String(window.device.cordova)).length > 0).toBe(true);
	});
});
