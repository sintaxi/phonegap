describe('Notification (navigator.notification)', function () {
	it("should exist", function() {
        expect(navigator.notification).toBeDefined();
	});

	it("should contain a vibrate function", function() {
		expect(typeof navigator.notification.vibrate).toBeDefined();
		expect(typeof navigator.notification.vibrate).toBe("function");
	});

	it("should contain a beep function", function() {
		expect(typeof navigator.notification.beep).toBeDefined();
		expect(typeof navigator.notification.beep).toBe("function");
	});

	it("should contain a alert function", function() {
		expect(typeof navigator.notification.alert).toBeDefined();
		expect(typeof navigator.notification.alert).toBe("function");
	});
});
