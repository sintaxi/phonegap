describe('Network (navigator.network)', function () {
	it("should exist", function() {
        expect(navigator.network).toBeDefined();
	});

    describe('Network Information API', function () {
        it("connection should exist", function() {
            expect(navigator.network.connection).toBeDefined();
        });

        it("should contain connection properties", function() {
            expect(navigator.network.connection.type).toBeDefined();
        });

        it("should define constants for connection status", function() {
            expect(Connection.UNKNOWN).toBe("unknown");
            expect(Connection.ETHERNET).toBe("ethernet");
            expect(Connection.WIFI).toBe("wifi");
            expect(Connection.CELL_2G).toBe("2g");
            expect(Connection.CELL_3G).toBe("3g");
            expect(Connection.CELL_4G).toBe("4g");
            expect(Connection.NONE).toBe("none");
        });
    });
});
