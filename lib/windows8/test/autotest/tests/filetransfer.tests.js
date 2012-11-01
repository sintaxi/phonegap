describe('FileTransfer', function() {
    it("should exist and be constructable", function() {
        var ft = new FileTransfer();
        expect(ft).toBeDefined();
    });
    it("should contain proper functions", function() {
        var ft = new FileTransfer();
        expect(typeof ft.upload).toBe('function');
        expect(typeof ft.download).toBe('function');
    });
    describe('FileTransferError', function() {
        it("FileTransferError constants should be defined", function() {
            expect(FileTransferError.FILE_NOT_FOUND_ERR).toBe(1);
            expect(FileTransferError.INVALID_URL_ERR).toBe(2);
            expect(FileTransferError.CONNECTION_ERR).toBe(3);
        });
    });
    describe('download method', function() {
        it("should be able to download a file", function() {
            var fail = jasmine.createSpy();
            var remoteFile = "https://github.com/ajaxorg/cloud9/blob/master/server.js";
            var localFileName = remoteFile.substring(remoteFile.lastIndexOf('/')+1);
            var downloadWin = jasmine.createSpy().andCallFake(function(entry) {
                expect(entry.name).toBe(localFileName);
            });
            var fileWin = function(fileEntry) {
                var ft = new FileTransfer();
                ft.download(remoteFile, fileEntry.fullPath, downloadWin);
            };
            
            // root is defined in the html page containing these tests
            runs(function() {
                root.getFile(localFileName, {create: true, exclusive: false}, fileWin, fail);
            });

            waitsFor(function() { return downloadWin.wasCalled; }, "downloadWin", Tests.TEST_TIMEOUT);

            runs(function() {
                expect(downloadWin).toHaveBeenCalled();
                expect(fail).not.toHaveBeenCalled();
            });
        });
    });
    describe('upload method', function () {
        it("should be able to upload a file", function () {
            var fail = jasmine.createSpy();
            var localFileName = "server.js";
            var localFile = root.fullPath + "\\" + localFileName;
            var Url = "http://localhost:5000/upload";
            var uploadWin = jasmine.createSpy().andCallFake(function (entry) {
                expect(entry.responseCode).toBe(200);
            });
            var fileWin = function (fileEntry) {
                console.log("1========");
                var ft = new FileTransfer();
                ft.upload(localFile, Url, uploadWin,fail,null);
            };

            // root is defined in the html page containing these tests
            runs(function () {
                root.getFile(localFileName, { create: false }, fileWin, fail);
            });

            waitsFor(function () { return uploadWin.wasCalled; }, "uploadWin", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(uploadWin).toHaveBeenCalled();
                expect(fail).not.toHaveBeenCalled();
            });
        });
    });
});
