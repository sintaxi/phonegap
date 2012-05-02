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
            var remoteFile = "https://ajax.googleapis.com/ajax/libs/dojo/1.7.2/dojo/dojo.js";
            var localFileName = remoteFile.substring(remoteFile.lastIndexOf('/')+1);
            var downloadWin = jasmine.createSpy().andCallFake(function(entry) {
				console.log("got download callback");
                expect(entry.name).toBe(localFileName);
            });
            var fileWin = function(fileEntry) {
                var ft = new FileTransfer();
                ft.download(remoteFile, fileEntry.fullPath, downloadWin,fail);
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
});
