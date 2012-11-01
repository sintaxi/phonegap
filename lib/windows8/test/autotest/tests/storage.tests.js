describe("Session Storage", function () {
    it("should exist", function () {
        expect(window.sessionStorage).toBeDefined();
        expect(typeof window.sessionStorage.length).not.toBe('undefined');
        expect(typeof(window.sessionStorage.key)).toBe('function');
        expect(typeof(window.sessionStorage.getItem)).toBe('function');
        expect(typeof(window.sessionStorage.setItem)).toBe('function');
        expect(typeof(window.sessionStorage.removeItem)).toBe('function');
        expect(typeof(window.sessionStorage.clear)).toBe('function');
    });

    it("check length", function () {
        expect(window.sessionStorage.length).toBe(0);
        window.sessionStorage.setItem("key","value");
        expect(window.sessionStorage.length).toBe(1);
        window.sessionStorage.removeItem("key");   
        expect(window.sessionStorage.length).toBe(0);
    });

    it("check key", function () {
        //expect(window.sessionStorage.key(0)).toBe(null);
        window.sessionStorage.setItem("test","value");
        expect(window.sessionStorage.key(0)).toBe("test");
        window.sessionStorage.removeItem("test");   
        //expect(window.sessionStorage.key(0)).toBe(null);
    });

    it("check getItem", function() {
        expect(window.sessionStorage.getItem("item")).toBe(null);
        window.sessionStorage.setItem("item","value");
        expect(window.sessionStorage.getItem("item")).toBe("value");
        window.sessionStorage.removeItem("item");   
        expect(window.sessionStorage.getItem("item")).toBe(null);
    });

    it("check setItem", function() {
        expect(window.sessionStorage.getItem("item")).toBe(null);
        window.sessionStorage.setItem("item","value");
        expect(window.sessionStorage.getItem("item")).toBe("value");
        window.sessionStorage.setItem("item","newval");
        expect(window.sessionStorage.getItem("item")).toBe("newval");
        window.sessionStorage.removeItem("item");   
        expect(window.sessionStorage.getItem("item")).toBe(null);
    });

    it("can remove an item", function () {
        expect(window.sessionStorage.getItem("item")).toBe(null);
        window.sessionStorage.setItem("item","value");
        expect(window.sessionStorage.getItem("item")).toBe("value");
        window.sessionStorage.removeItem("item");   
        expect(window.sessionStorage.getItem("item")).toBe(null);
    });

    it("check clear", function() {
        window.sessionStorage.setItem("item1","value");
        window.sessionStorage.setItem("item2","value");
        window.sessionStorage.setItem("item3","value");
        expect(window.sessionStorage.length).toBe(3);
        window.sessionStorage.clear();
        expect(window.sessionStorage.length).toBe(0);
    });

    it("check dot notation", function() {
        expect(window.sessionStorage.item).not.toBeDefined();
        window.sessionStorage.item = "value";
        expect(window.sessionStorage.item).toBe("value");
        window.sessionStorage.removeItem("item");   
        expect(window.sessionStorage.item).not.toBeDefined();
    });

   
    describe("Local Storage", function () {
        it("should exist", function() {
            expect(window.localStorage).toBeDefined();
            expect(window.localStorage.length).toBeDefined();
            expect(typeof window.localStorage.key).toBe("function");
            expect(typeof window.localStorage.getItem).toBe("function");
            expect(typeof window.localStorage.setItem).toBe("function");
            expect(typeof window.localStorage.removeItem).toBe("function");
            expect(typeof window.localStorage.clear).toBe("function");
        });  

        it("check length", function() {
            var len = window.localStorage.length;
            window.localStorage.setItem("key","value");
            expect(window.localStorage.length).toBe(len+1);
            window.localStorage.removeItem("key");   
            expect(window.localStorage.length).toBe(len);
        });

        it("check key", function () {
            var len = window.localStorage.length;
            window.localStorage.setItem("test", "value");
            expect(window.localStorage.key(len)).toBe("test");
            window.localStorage.removeItem("test");   
            //expect(window.localStorage.key(0)).toBe(null);
        });

        it("check getItem", function() {
            expect(window.localStorage.getItem("item")).toBe(null);
            window.localStorage.setItem("item","value");
            expect(window.localStorage.getItem("item")).toBe("value");
            window.localStorage.removeItem("item");   
            expect(window.localStorage.getItem("item")).toBe(null);
        });

        it("check setItem", function() {
            expect(window.localStorage.getItem("item")).toBe(null);
            window.localStorage.setItem("item","value");
            expect(window.localStorage.getItem("item")).toBe("value");
            window.localStorage.setItem("item","newval");
            expect(window.localStorage.getItem("item")).toBe("newval");
            window.localStorage.removeItem("item");   
            expect(window.localStorage.getItem("item")).toBe(null);
        });

        it("check removeItem", function() {
            expect(window.localStorage.getItem("item")).toBe(null);
            window.localStorage.setItem("item","value");
            expect(window.localStorage.getItem("item")).toBe("value");
            window.localStorage.removeItem("item");   
            expect(window.localStorage.getItem("item")).toBe(null);
        });

        it("check clear", function () {
            var len = window.localStorage.length;
            expect(window.localStorage.getItem("item1")).toBe(null);
            expect(window.localStorage.getItem("item2")).toBe(null);
            expect(window.localStorage.getItem("item3")).toBe(null);
            window.localStorage.setItem("item1","value");
            window.localStorage.setItem("item2","value");
            window.localStorage.setItem("item3","value");
            expect(window.localStorage.getItem("item1")).toBe("value");
            expect(window.localStorage.getItem("item2")).toBe("value");
            expect(window.localStorage.getItem("item3")).toBe("value");
            expect(window.localStorage.length).toBe(len+3);
            window.localStorage.clear();
            expect(window.localStorage.length).toBe(0);
            expect(window.localStorage.getItem("item1")).toBe(null);
            expect(window.localStorage.getItem("item2")).toBe(null);
            expect(window.localStorage.getItem("item3")).toBe(null);
        });

        it("check dot notation", function() {
            expect(window.localStorage.item).not.toBeDefined();
            window.localStorage.item = "value";
            expect(window.localStorage.item).toBe("value");
            window.localStorage.removeItem("item");   
            expect(window.localStorage.item).not.toBeDefined();
        });
    });

    /* WEB SQL is NOT supported!"
    describe("HTML 5 Storage", function () {
     
        it("should exist", function() {
            expect(window.openDatabase);
        });

        it("Should open a database", function () {
            var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
            expect(db).toBeDefined();
        });

        it("should retrieve a correct database object", function () {
            var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
            expect(db).toBeDefined();
            expect(typeof (db.transaction)).toBe('function');
            //expect(typeof (db.changeVersion)).toBe('function');
        });

        it("Should insert data and return SQLResultSet objects", function () {
            function populateDB(tx) {
                tx.executeSql('CREATE TABLE Item (name TEXT, price REAL, id INT PRIMARY KEY)');
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Apple', 1.2, 1]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Orange', 2.5, 2]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Banana', 3, 3]);
                tx.executeSql('SELECT * FROM Item', null, successCB, errorCB);
                tx.executeSql('DROP TABLE Item');
            }

            var errorCB = jasmine.createSpy().andCallFake(function (error) {
                console.log("error callBack , error code:" + error.code);
                
            });
            var successCB = jasmine.createSpy().andCallFake(function (tx, results) {
                expect(tx).toBeDefined();
                expect(results).toBeDefined();
                expect(results.rows.item(0).id).toBe(1);
                expect(results.rows.item(1).id).toBe(2);
                expect(results.rows.item(2).id).toBe(3);
            });
            runs(function () {
                var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
                db.transaction(populateDB, errorCB);
            });
            
            waitsFor(function () { return successCB.wasCalled; }, "Insert callback never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(successCB).toHaveBeenCalled();
                expect(errorCB).not.toHaveBeenCalled();
            });
        });

        it('should return the correct count', function () {
           
            function populateDB(tx) {
                tx.executeSql('CREATE TABLE Item (name TEXT, price REAL, id INT PRIMARY KEY)');
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Apple', 1.2, 1]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Orange', 2.5, 2]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Banana', 3, 3]);
                tx.executeSql('SELECT COUNT(*) AS count FROM Item', null, successCB, errorCB);
                tx.executeSql('DROP TABLE Item');
            }
            var errorCB = jasmine.createSpy().andCallFake(function (error) {
                console.log("error callBack , error code:" + error.code);

            });
            var successCB = jasmine.createSpy().andCallFake(function (tx, results) {
                expect(tx).toBeDefined();
                expect(results).toBeDefined();
                expect(results.rows.item(0).count).toEqual(3);
            });
            runs(function () {
                var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
                db.transaction(populateDB, errorCB);
            });

            waitsFor(function () { return successCB.wasCalled; }, "Insert callback never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(successCB).toHaveBeenCalled();
                expect(errorCB).not.toHaveBeenCalled();
            });
            
        });

        it('should return an item by id', function () {
            function populateDB(tx) {
                tx.executeSql('CREATE TABLE Item (name TEXT, price REAL, id INT PRIMARY KEY)');
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Apple', 1.2, 1]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Orange', 2.5, 2]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Banana', 3, 3]);
                tx.executeSql('SELECT * FROM Item WHERE id = ?', [2], successCB, errorCB);
                tx.executeSql('DROP TABLE Item');
            }
            var errorCB = jasmine.createSpy().andCallFake(function (error) {
                console.log("error callBack , error code:" + error.code);

            });
            var successCB = jasmine.createSpy().andCallFake(function (tx, results) {
                expect(tx).toBeDefined();
                expect(results).toBeDefined();
                expect(results.rows.length).toEqual(1);
                expect(results.rows.item(0).name).toEqual('Orange');
                expect(results.rows.item(0).price).toEqual(2.5);
                expect(results.rows.item(0).id).toEqual(2);
            });
            runs(function () {
                var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
                db.transaction(populateDB, errorCB);
            });

            waitsFor(function () { return successCB.wasCalled; }, "Insert callback never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(successCB).toHaveBeenCalled();
                expect(errorCB).not.toHaveBeenCalled();
            });
        });


        it('should return items with names ending on "e"', function () {
            function populateDB(tx) {
                tx.executeSql('CREATE TABLE Item (name TEXT, price REAL, id INT PRIMARY KEY)');
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Apple', 1.2, 1]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Orange', 2.5, 2]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Banana', 3, 3]);
                tx.executeSql('SELECT * FROM Item WHERE name LIKE ? ORDER BY id ASC', ['%e'], successCB, errorCB);
                tx.executeSql('DROP TABLE Item');
            }
            var errorCB = jasmine.createSpy().andCallFake(function (error) {
                console.log("error callBack , error code:" + error.code);

            });
            var successCB = jasmine.createSpy().andCallFake(function (tx, results) {
                expect(tx).toBeDefined();
                expect(results).toBeDefined();
                expect(results.rows.length).toEqual(2);
                expect(results.rows.item(0).name).toEqual('Apple');
                expect(results.rows.item(1).name).toEqual('Orange');
                expect(results.rows.item(0).id).toEqual(1);
            });
            runs(function () {
                var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
                db.transaction(populateDB, errorCB);
            });

            waitsFor(function () { return successCB.wasCalled; }, "Insert callback never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(successCB).toHaveBeenCalled();
                expect(errorCB).not.toHaveBeenCalled();
            });

        });

        it('should allow binding null arguments', function () {
            var name = 'Mango';
            function populateDB(tx) {
                tx.executeSql('CREATE TABLE Item (name TEXT, price REAL, id INT PRIMARY KEY)');
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', [name, null, null]);
                tx.executeSql('SELECT * FROM Item WHERE name = ?', [name], successCB, errorCB);
                tx.executeSql('DROP TABLE Item');
            }
            var errorCB = jasmine.createSpy().andCallFake(function (error) {
                console.log("error callBack , error code:" + error.code);

            });
            var successCB = jasmine.createSpy().andCallFake(function (tx, results) {
                expect(tx).toBeDefined();
                expect(results).toBeDefined();
                expect(results.rows.length).toEqual(1);
                expect(results.rows.item(0).name).toEqual(name);
                expect(results.rows.item(0).price).toEqual(null);
                expect(results.rows.item(0).id).toEqual(null);
            });
            runs(function () {
                var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
                db.transaction(populateDB, errorCB);
            });

            waitsFor(function () { return successCB.wasCalled; }, "Insert callback never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(successCB).toHaveBeenCalled();
                expect(errorCB).not.toHaveBeenCalled();
            });

        });

        it("should error about invalid syntax", function () {
            function populateDB(tx) {
                tx.executeSql('CREATE TABLE11 Item (name TEXT, price REAL, id INT PRIMARY KEY)' , null , successCB , errorCB);
            }
            var successCB = jasmine.createSpy().andCallFake(function (tx, results) {
                expect(tx).toBeDefined();
                expect(results).toBeDefined();

            });

            var errorCB = jasmine.createSpy().andCallFake(function (error) {
                expect(error).toBeDefined();
                expect(error.code).toBe(5);
            });

            runs(function () {
                var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
                db.transaction(populateDB, errorCB);
            });
            waitsFor(function () { return errorCB.wasCalled; }, "error callback never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(errorCB).toHaveBeenCalled();
                expect(successCB).not.toHaveBeenCalled();
            });
        });


        it("should error about invalid params", function () {
            function populateDB(tx) {
                tx.executeSql('CREATE TABLE Item (name TEXT, price REAL, id INT PRIMARY KEY)');
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Apple', 1.2, 1]);
                tx.executeSql('INSERT INTO Item (name, price, id) VALUES (?, ?, ?)', ['Orange', 2.5, 1] , successCB , errorCB);
                tx.executeSql('DROP TABLE Item');
            }
            var successCB = jasmine.createSpy().andCallFake(function (tx, results) {
                expect(tx).toBeDefined();
                expect(results).toBeDefined();
                
            });

            var errorCB = jasmine.createSpy().andCallFake(function (error) {
                expect(error).toBeDefined();
                expect(error.code).toBe(5);
            });
            runs(function () {
                var db = openDatabase("Database", "1.0", "HTML5 Database API example", 200000);
                db.transaction(populateDB , errorCB);
            });

            waitsFor(function () { return errorCB.wasCalled; }, "error callback never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(errorCB).toHaveBeenCalled();
                expect(successCB).not.toHaveBeenCalled();
            });
        });
        it('should return null when creating an invalid name', function () {
            var db = openDatabase("invalid::name", "1.0", "HTML5 Database API example", 200000);
            expect(db).toBe(null);
            
        });
    });

    */
});
