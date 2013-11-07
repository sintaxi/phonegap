var channel = require("cordova/channel"),
    utils = require('cordova/utils'),
    exec = require('cordova/exec');

var queryQueue = {};

var Rows = function () {
    this.resultSet = [];    // results array
    this.length = 0;        // number of rows
};

Rows.prototype.item = function (row) {
    return this.resultSet[row];
};

var Result = function () {
    this.rows = new Rows();
};

function completeQuery(result) {
    var id = result.id;
    var data = result.data;
    var query = queryQueue[id];
    if (query) {
        try {
            delete queryQueue[id];

            // Get transaction
            var tx = query.tx;

            // If transaction hasn't failed
            // Note: We ignore all query results if previous query
            //       in the same transaction failed.
            if (tx && tx.queryList[id]) {

                // Save query results
                var r = new Result();
                r.rows.resultSet = data;
                r.rows.length = data.length;
                try {
                    if (typeof query.successCallback === 'function') {
                        query.successCallback(query.tx, r);
                    }
                } catch (ex) {
                    console.log("executeSql error calling user success callback: " + ex);
                }

                tx.queryComplete(id);
            }
        } catch (e) {
            console.log("executeSql error: " + e);
        }
    }
}

function failQuery(result) {
    var id = result.id;
    var reason = result.reason;
    var query = queryQueue[id];
    if (query) {
        try {
            delete queryQueue[id];

            // Get transaction
            var tx = query.tx;

            // If transaction hasn't failed
            // Note: We ignore all query results if previous query
            //       in the same transaction failed.
            if (tx && tx.queryList[id]) {
                tx.queryList = {};

                try {
                    if (typeof query.errorCallback === 'function') {
                        query.errorCallback(query.tx, reason);
                    }
                } catch (ex) {
                    console.log("executeSql error calling user error callback: " + ex);
                }

                tx.queryFailed(id, reason);
            }

        } catch (e) {
            console.log("executeSql error: " + e);
        }
    }
}

var Query = function (tx) {

    // Set the id of the query
    this.id = utils.createUUID();

    // Add this query to the queue
    queryQueue[this.id] = this;

    // Init result
    this.resultSet = [];

    // Set transaction that this query belongs to
    this.tx = tx;

    // Add this query to transaction list
    this.tx.queryList[this.id] = this;

    // Callbacks
    this.successCallback = null;
    this.errorCallback = null;

};

var Transaction = function (database) {
    this.db = database;
    // Set the id of the transaction
    this.id = utils.createUUID();

    // Callbacks
    this.successCallback = null;
    this.errorCallback = null;

    // Query list
    this.queryList = {};
};

Transaction.prototype.queryComplete = function (id) {
    delete this.queryList[id];

    // If no more outstanding queries, then fire transaction success
    if (this.successCallback) {
        var count = 0;
        var i;
        for (i in this.queryList) {
            if (this.queryList.hasOwnProperty(i)) {
                count++;
            }
        }
        if (count === 0) {
            try {
                this.successCallback();
            } catch (e) {
                console.log("Transaction error calling user success callback: " + e);
            }
        }
    }
};

Transaction.prototype.queryFailed = function (id, reason) {

    // The sql queries in this transaction have already been run, since
    // we really don't have a real transaction implemented in native code.
    // However, the user callbacks for the remaining sql queries in transaction
    // will not be called.
    this.queryList = {};

    if (this.errorCallback) {
        try {
            this.errorCallback(reason);
        } catch (e) {
            console.log("Transaction error calling user error callback: " + e);
        }
    }
};

Transaction.prototype.executeSql = function (sql, params, successCallback, errorCallback) {
    // Init params array
    if (typeof params === 'undefined') {
        params = [];
    }

    // Create query and add to queue
    var query = new Query(this);
    queryQueue[query.id] = query;

    // Save callbacks
    query.successCallback = successCallback;
    query.errorCallback = errorCallback;

    // Call native code
    exec(completeQuery, failQuery, "Storage", "executeSql", [this.db.id, sql, params, query.id]);
};

var Database = function (dbId) {
    this.id = dbId;
};

Database.prototype.transaction = function (process, errorCallback, successCallback) {
    var tx = new Transaction(this);
    tx.successCallback = successCallback;
    tx.errorCallback = errorCallback;

    try {
        process(tx);
    } catch (e) {
        console.log("Transaction error: " + e);
        if (tx.errorCallback) {
            try {
                tx.errorCallback(e);
            } catch (ex) {
                console.log("Transaction error calling user error callback: " + e);
            }
        }
    }
};

var WinStorage = function (dbName) {
    channel.waitForInitialization("winStorage" + dbName);

    try {

        this.db = openDatabase(dbName, '1.0', dbName, 2621440);
        var storage = {};
        this.length = 0;
        function setLength(length) {
            this.length = length;
        }
        this.db.transaction(
        function (transaction) {
            var i;
            transaction.executeSql('CREATE TABLE IF NOT EXISTS storage (id NVARCHAR(40) PRIMARY KEY, body NVARCHAR(255))');
            transaction.executeSql('SELECT * FROM storage', [], function (tx, result) {
                for (var i = 0; i < result.rows.length; i++) {
                    storage[result.rows.item(i).id] = result.rows.item(i).body;
                }
                setLength(result.rows.length);
                channel.initializationComplete("winStorage" + dbName);
            });

        },
        function (err) {
            utils.alert(err.message);
        }
      );
        this.setItem = function (key, val) {
            if (typeof (storage[key]) == 'undefined') {
                this.length++;
            }
            storage[key] = val;
            this.db.transaction(
          function (transaction) {
              transaction.executeSql('CREATE TABLE IF NOT EXISTS storage (id NVARCHAR(40) PRIMARY KEY, body NVARCHAR(255))');
              transaction.executeSql('REPLACE INTO storage (id, body) values(?,?)', [key, val]);
          }
        );
        };
        this.getItem = function (key) {
            return (typeof (storage[key]) == 'undefined') ? null : storage[key];
        };
        this.removeItem = function (key) {
            delete storage[key];
            this.length--;
            this.db.transaction(
          function (transaction) {
              transaction.executeSql('CREATE TABLE IF NOT EXISTS storage (id NVARCHAR(40) PRIMARY KEY, body NVARCHAR(255))');
              transaction.executeSql('DELETE FROM storage where id=?', [key]);
          }
        );
        };
        this.clear = function () {
            storage = {};
            this.length = 0;
            this.db.transaction(
          function (transaction) {
              transaction.executeSql('CREATE TABLE IF NOT EXISTS storage (id NVARCHAR(40) PRIMARY KEY, body NVARCHAR(255))');
              transaction.executeSql('DELETE FROM storage', []);
          }
        );
        };
        this.key = function (index) {
            var i = 0;
            for (var j in storage) {
                if (i == index) {
                    return j;
                } else {
                    i++;
                }
            }
            return null;
        };

    } catch (e) {
        utils.alert("Database error " + e + ".");
        return;
    }
};

function openDatabase(name, version, display_name, size) {
    var dbId = exec(null, null, "Storage", "openDatabase", [name, version, display_name, size]);
    return new Database(dbId);
}

function removeDatabase(name) {
    exec(null, null, "Storage", "removeDatabase", [name]);
}

module.exports = {
    openDatabase: openDatabase,
    removeDatabase: removeDatabase,
    WinStorage: WinStorage
};