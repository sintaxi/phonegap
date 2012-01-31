Tests.prototype.FileTransferTests = function () {
    module('FileTransfer');
    var fileTransfer = new FileTransfer();
    test("FileTransfer constructor should exist", function () {
        expect(1);
        ok(fileTransfer != null, "fileTransfer should not be null.");
    });
    test("should contain an upload function", function () {
        expect(2);
        ok(typeof fileTransfer.upload != 'undefined' && fileTransfer.upload != null, "fileTransfer.upload should not be null.");
        ok(typeof fileTransfer.upload == 'function', "fileTransfer.upload should be a function.");
    });
    test("Upload a file to wrong Url", function () {
        QUnit.stop(Tests.TEST_TIMEOUT);
        expect(2);

        var fail = function (error) {
            ok(error !== null, "error should not be null.");
            equal(error.code, FileTransferError.INVALID_URL_ERR, "Should receive error code FileTransferError.INVALID_URL_ERR");
            QUnit.start();
        }

        fileTransfer.upload("somefile.txt", "WrongUri", null, fail, null);
    });
    test("Upload a file that doesn't exist", function () {
        QUnit.stop(Tests.TEST_TIMEOUT);
        expect(2);

        var fail = function (error) {
            ok(error !== null, "error should not be null.");
            equal(error.code, FileTransferError.FILE_NOT_FOUND_ERR, "Should receive error code FileTransferError.FILE_NOT_FOUND_ERR");
            QUnit.start();
        }
        fileTransfer.upload("somefile.txt", "http://google.com", null, fail, null);
    });

};