var SQLError = function () {
};

SQLError.UNKNOWN_ERR = 0;
SQLError.DATABASE_ERR = 1;
SQLError.VERSION_ERR = 2;
SQLError.TOO_LARGE_ERR = 3;
SQLError.QUOTA_ERR = 4;
SQLError.SYNTAX_ERR = 5;
SQLError.CONSTRAINT_ERR = 6;
SQLError.TIMEOUT_ERR = 7;

module.exports = SQLError;