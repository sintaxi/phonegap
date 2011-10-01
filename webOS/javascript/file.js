
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */

/**
 * FileError
 */
function FileError() {
    this.code = null;
};

// File error codes
// Found in DOMException
FileError.NOT_FOUND_ERR = 1;
FileError.SECURITY_ERR = 2;
FileError.ABORT_ERR = 3;

// Added by File API specification
FileError.NOT_READABLE_ERR = 4;
FileError.ENCODING_ERR = 5;
FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
FileError.INVALID_STATE_ERR = 7;
FileError.SYNTAX_ERR = 8;
FileError.INVALID_MODIFICATION_ERR = 9;
FileError.QUOTA_EXCEEDED_ERR = 10;
FileError.TYPE_MISMATCH_ERR = 11;
FileError.PATH_EXISTS_ERR = 12;

/**
 * navigator.fileMgr
 * 
 * Provides file utility methods.
 */
(function() {
    /**
     * Check that navigator.fileMgr has not been initialized.
     */
    if (typeof navigator.fileMgr !== "undefined") {
        return;
    }
    
    /**
     * @constructor
     */
    function FileMgr() {
    };

    /**
     * Returns the available memory in bytes for the root file system of the
     * specified file path.
     * 
     * @param filePath A file system path
     */
    FileMgr.prototype.getFreeDiskSpace = function(filePath) {
        return blackberry.io.dir.getFreeSpaceForRoot(filePath);
    };

    /**
     * Tests whether file exists.  Will return false if the path specifies a directory.
     * 
     * @param fullPath             The full path of the file 
     */
    FileMgr.prototype.testFileExists = function(fullPath) {
        return blackberry.io.file.exists(fullPath);
    };

    /**
     * Tests whether directory exists.  Will return false if the path specifies a file.
     * 
     * @param fullPath             The full path of the directory
     */
    FileMgr.prototype.testDirectoryExists = function(fullPath) {
        return blackberry.io.dir.exists(fullPath);
    };

    /**
     * Reads a file from the device and encodes the contents using the specified 
     * encoding. 
     * 
     * @param fileName          The full path of the file to read
     * @param encoding          The encoding to use to encode the file's content
     * @param successCallback   Callback invoked with file contents
     * @param errorCallback     Callback invoked on error
     */
    FileMgr.prototype.readAsText = function(fileName, encoding, successCallback, errorCallback) {
        PhoneGap.exec(successCallback, errorCallback, "File", "readAsText", [fileName, encoding]);
    };

    /**
     * Reads a file from the device and encodes the contents using BASE64 encoding.  
     * 
     * @param fileName          The full path of the file to read.
     * @param successCallback   Callback invoked with file contents
     * @param errorCallback     Callback invoked on error
     */
    FileMgr.prototype.readAsDataURL = function(fileName, successCallback, errorCallback) {
        PhoneGap.exec(successCallback, errorCallback, "File", "readAsDataURL", [fileName]);
    };

    /**
     * Writes data to the specified file.
     * 
     * @param fileName          The full path of the file to write
     * @param data              The data to be written
     * @param position          The position in the file to begin writing
     * @param successCallback   Callback invoked after successful write operation
     * @param errorCallback     Callback invoked on error
     */
    FileMgr.prototype.write = function(fileName, data, position, successCallback, errorCallback) {
        PhoneGap.exec(successCallback, errorCallback, "File", "write", [fileName, data, position]);
    };

    /**
     * Changes the length of the specified file.  Data beyond new length is discarded.  
     * 
     * @param fileName          The full path of the file to truncate
     * @param size              The size to which the length of the file is to be adjusted
     * @param successCallback   Callback invoked after successful write operation
     * @param errorCallback     Callback invoked on error
     */
    FileMgr.prototype.truncate = function(fileName, size, successCallback, errorCallback) {
        PhoneGap.exec(successCallback, errorCallback, "File", "truncate", [fileName, size]);
    };

    /**
     * Define navigator.fileMgr object.
     */
    PhoneGap.addConstructor(function() {
        navigator.fileMgr = new FileMgr();
    });
}());

/**
 * FileReader
 * 
 * Reads files from the device file system.
 */
var FileReader = FileReader || (function() {
    /**
     * @constructor
     */
    function FileReader() {
        this.fileName = "";

        this.readyState = 0;

        // File data
        this.result = null;

        // Error
        this.error = null;

        // Event handlers
        this.onloadstart = null;    // When the read starts.
        this.onprogress = null;     // While reading (and decoding) file or fileBlob data, and reporting partial file data (progess.loaded/progress.total)
        this.onload = null;         // When the read has successfully completed.
        this.onerror = null;        // When the read has failed (see errors).
        this.onloadend = null;      // When the request has completed (either in success or failure).
        this.onabort = null;        // When the read has been aborted. For instance, by invoking the abort() method.
    };
    
    /**
     * States
     */
    FileReader.EMPTY = 0;
    FileReader.LOADING = 1;
    FileReader.DONE = 2;
    
    /**
     * Abort read file operation.
     */
    FileReader.prototype.abort = function() {
        var event;
        
        // reset everything
        this.readyState = FileReader.DONE;
        this.result = null;
        
        // set error
        var error = new FileError();
        error.code = error.ABORT_ERR;
        this.error = error;

        // abort procedure
        if (typeof this.onerror == "function") {
            event = {"type":"error", "target":this};
            this.onerror(event);
        }
        if (typeof this.onabort == "function") {
            event = {"type":"abort", "target":this};
            this.onabort(event);
        }
        if (typeof this.onloadend == "function") {
            event = {"type":"loadend", "target":this};
            this.onloadend(event);
        }
    };

    /**
     * Reads and encodes a text file.
     *
     * @param file          {File} File object containing file properties
     * @param encoding      [Optional] (see http://www.iana.org/assignments/character-sets)
     */
    FileReader.prototype.readAsText = function(file, encoding) {
        var event;
        
        // Use UTF-8 as default encoding
        var enc = encoding ? encoding : "UTF-8";
        
        // start
        this.readyState = FileReader.LOADING;
        if (typeof this.onloadstart == "function") {
            event = {"type":"loadstart", "target":this};
            this.onloadstart(event);
        }

        // read and encode file
        this.fileName = file.fullPath;
        var me = this;
        navigator.fileMgr.readAsText(file.fullPath, enc, 

            // success callback
            function(result) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // success procedure
                me.result = result;
                if (typeof me.onload == "function") {
                    event = {"type":"load", "target":me};
                    me.onload(event);
                }
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend == "function") {
                    event = {"type":"loadend", "target":me};
                    me.onloadend(event);
                }
            },

            // error callback
            function(error) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // capture error
                var err = new FileError();
                err.code = error;
                me.error = err;
                
                // error procedure
                me.result = null;
                if (typeof me.onerror == "function") {
                    event = {"type":"error", "target":me};
                    me.onerror(event);
                }
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend == "function") {
                    event = {"type":"loadend", "target":me};
                    me.onloadend(event);
                }
            }
        );
    };

    /**
     * Read file and return data as a base64 encoded data url.
     * A data url is of the form:
     *      data:[<mediatype>][;base64],<data>
     *
     * @param file          {File} File object containing file properties
     */
    FileReader.prototype.readAsDataURL = function(file) {
        var event;
        
        // start
        this.readyState = FileReader.LOADING;
        if (typeof this.onloadstart == "function") {
            event = {"type":"loadstart", "target":this};
            this.onloadstart(event);
        }
        
        // read and encode file
        this.fileName = file.fullPath;
        var me = this;
        navigator.fileMgr.readAsDataURL(file.fullPath, 

            // success callback
            function(result) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // success procedure
                me.result = result;
                if (typeof me.onload == "function") {
                    event = {"type":"load", "target":me};
                    me.onload(event);
                }
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend == "function") {
                    event = {"type":"loadend", "target":me};
                    me.onloadend(event);
                }
            },

            // error callback
            function(error) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                // capture error
                var err = new FileError();
                err.code = error;
                me.error = err;
                
                // error procedure
                me.result = null;
                if (typeof me.onerror == "function") {
                    event = {"type":"error", "target":me};
                    me.onerror(event);
                }
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend == "function") {
                    event = {"type":"loadend", "target":me};
                    me.onloadend(event);
                }
            }
        );
    };
    
    return FileReader;
}());

/**
 * FileWriter
 * 
 * Writes files to the device file system.
 */
var FileWriter = FileWriter || (function() {
    /**
     * @constructor
     * @param file {File} a File object representing a file on the file system
     */
    function FileWriter(file) {
        this.fileName = file.fullPath || null;
        this.length = file.size || 0;
        
        // default is to write at the beginning of the file
        this.position = 0;
        
        this.readyState = 0; // EMPTY
        
        // Error
        this.error = null;

        // Event handlers
        this.onwritestart = null;   // When writing starts
        this.onprogress = null;     // While writing the file, and reporting partial file data
        this.onwrite = null;        // When the write has successfully completed.
        this.onwriteend = null;     // When the request has completed (either in success or failure).
        this.onabort = null;        // When the write has been aborted. For instance, by invoking the abort() method.
        this.onerror = null;        // When the write has failed (see errors).
    };

    /**
     * States
     */
    FileWriter.INIT = 0;
    FileWriter.WRITING = 1;
    FileWriter.DONE = 2;
    
    /**
     * Abort writing file.
     */
    FileWriter.prototype.abort = function() {
        var event;

        // check for invalid state 
        if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
            throw FileError.INVALID_STATE_ERR;
        }
        
        // set error
        var error = new FileError();
        error.code = error.ABORT_ERR;
        this.error = error;

        // dispatch progress events
        if (typeof this.onerror == "function") {
            event = {"type":"error", "target":this};
            this.onerror(event);
        }
        if (typeof this.onabort == "function") {
            event = {"type":"abort", "target":this};
            this.onabort(event);
        }

        // set state
        this.readyState = FileWriter.DONE;
        
        // done
        if (typeof this.writeend == "function") {
            event = {"type":"writeend", "target":this};
            this.writeend(event);
        }
    };    

    /**
     * Sets the file position at which the next write will occur.
     * 
     * @param offset    Absolute byte offset into the file
     */
    FileWriter.prototype.seek = function(offset) {
        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }

        if (!offset) {
            return;
        }
        
        // offset is bigger than file size, set to length of file
        if (offset > this.length) { 
            this.position = this.length;
        }
        // seek back from end of file
        else if (offset < 0) { 
            this.position = Math.max(offset + this.length, 0);
        } 
        // offset in the middle of file
        else {
            this.position = offset;
        }
    };
    
    /**
     * Truncates the file to the specified size.
     * 
     * @param size      The size to which the file length is to be adjusted
     */
    FileWriter.prototype.truncate = function(size) {
        var event;
        
        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }
        
        // start
        this.readyState = FileWriter.WRITING;
        if (typeof this.onwritestart == "function") {
            event = {"type":"writestart", "target":this};
            this.onwritestart(event);
        }

        // truncate file
        var me = this;
        navigator.fileMgr.truncate(this.fileName, size, 
            // Success callback receives the new file size
            function(result) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // new file size is returned
                me.length = result;
                // position is lesser of old position or new file size
                me.position = Math.min(me.position, result);

                // success procedure
                if (typeof me.onwrite == "function") {
                    event = {"type":"write", "target":me};
                    me.onwrite(event);
                }
                me.readyState = FileWriter.DONE;
                if (typeof me.onwriteend == "function") {
                    event = {"type":"writeend", "target":me};
                    me.onwriteend(event);
                }
            },

            // Error callback
            function(error) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // Save error
                var err = new FileError();
                err.code = error;
                me.error = err;

                // error procedure
                if (typeof me.onerror == "function") {
                    event = {"type":"error", "target":me};
                    me.onerror(event);
                }
                me.readyState = FileWriter.DONE;
                if (typeof me.onwriteend == "function") {
                    event = {"type":"writeend", "target":me};
                    me.onwriteend(event);
                }
            }            
        );
    };

    /**
     * Writes the contents of a file to the device.
     * 
     * @param data      contents to be written
     */
    FileWriter.prototype.write = function(data) {
        var event;
        
        // Throw an exception if we are already writing a file
        if (this.readyState === FileWriter.WRITING) {
            throw FileError.INVALID_STATE_ERR;
        }

        // WRITING state
        this.readyState = FileWriter.WRITING;
        if (typeof this.onwritestart == "function") {
            event = {"type":"writestart", "target":this};
            this.onwritestart(event);
        }

        // Write file
        var me = this;
        navigator.fileMgr.write(this.fileName, data, this.position,

            // Success callback receives bytes written
            function(result) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // new length is maximum of old length, or position plus bytes written
                me.length = Math.max(me.length, me.position + result);
                // position always increases by bytes written because file would be extended
                me.position += result;

                // success procedure
                if (typeof me.onwrite == "function") {
                    event = {"type":"write", "target":me};
                    me.onwrite(event);
                }
                me.readyState = FileWriter.DONE;
                if (typeof me.onwriteend == "function") {
                    event = {"type":"writeend", "target":me};
                    me.onwriteend(event);
                }
            },

            // Error callback
            function(error) {
                // If DONE (canceled), then don't do anything
                if (me.readyState === FileWriter.DONE) {
                    return;
                }

                // Save error
                var err = new FileError();
                err.code = error;
                me.error = err;

                // error procedure
                if (typeof me.onerror == "function") {
                    event = {"type":"error", "target":me};
                    me.onerror(event);
                }
                me.readyState = FileWriter.DONE;
                if (typeof me.onwriteend == "function") {
                    event = {"type":"writeend", "target":me};
                    me.onwriteend(event);
                }
            }
        );
    };

    return FileWriter;
}());

/**
 * Represents a file or directory on the local file system.
 */
var Entry = Entry || (function() {
    /**
     * Represents a file or directory on the local file system.
     * 
     * @param isFile
     *            {boolean} true if Entry is a file (readonly)
     * @param isDirectory
     *            {boolean} true if Entry is a directory (readonly)
     * @param name
     *            {DOMString} name of the file or directory, excluding the path
     *            leading to it (readonly)
     * @param fullPath
     *            {DOMString} the absolute full path to the file or directory
     *            (readonly)
     */
    function Entry(entry) {
        // protect against not using 'new'
        if (!(this instanceof Entry)) {
            return new Entry(entry);
        }
        this.isFile = (entry && entry.isFile === true) ? true : false;
        this.isDirectory = (entry && entry.isDirectory === true) ? true : false;
        this.name = (entry && entry.name) || "";
        this.fullPath = (entry && entry.fullPath) || "";            
    };

    /**
     * Look up the metadata of the entry.
     * 
     * @param successCallback
     *            {Function} is called with a Metadata object
     * @param errorCallback
     *            {Function} is called with a FileError
     */
    Entry.prototype.getMetadata = function(successCallback, errorCallback) {
        var success = function(lastModified) {
                var metadata = new Metadata();
                metadata.modificationTime = new Date(lastModified);
                if (typeof successCallback === "function") {
                    successCallback(metadata);
                }
            },
            fail = function(error) {
                LocalFileSystem.onError(error, errorCallback);
            };
            
        PhoneGap.exec(success, fail, "File", "getMetadata", [this.fullPath]);
    };

    /**
     * Move a file or directory to a new location.
     * 
     * @param parent
     *            {DirectoryEntry} the directory to which to move this entry
     * @param newName
     *            {DOMString} new name of the entry, defaults to the current name
     * @param successCallback
     *            {Function} called with the new DirectoryEntry object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    Entry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
        // source path
        var srcPath = this.fullPath,
            // entry name
            name = newName || this.name,
            // destination path
            dstPath,
            success = function(entry) {
                var result; 

                if (entry) {
                    // create appropriate Entry object
                    result = (entry.isDirectory) ? new DirectoryEntry(entry) : new FileEntry(entry);                
                    try {
                        successCallback(result);
                    }
                    catch (e) {
                        console.log('Error invoking callback: ' + e);
                    }
                } 
                else {
                    // no Entry object returned
                    fail(FileError.NOT_FOUND_ERR);
                }
            },
            fail = function(error) {
                LocalFileSystem.onError(error, errorCallback);
            };

        // user must specify parent Entry
        if (!parent) {
            fail(FileError.NOT_FOUND_ERR);
            return;
        }

        // copy
        PhoneGap.exec(success, fail, "File", "moveTo", [srcPath, parent.fullPath, name]);
    };

    /**
     * Copy a directory to a different location.
     * 
     * @param parent 
     *            {DirectoryEntry} the directory to which to copy the entry
     * @param newName 
     *            {DOMString} new name of the entry, defaults to the current name
     * @param successCallback
     *            {Function} called with the new Entry object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    Entry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
            // source path
        var srcPath = this.fullPath,
            // entry name
            name = newName || this.name,
            // success callback
            success = function(entry) {
                var result; 

                if (entry) {
                    // create appropriate Entry object
                    result = (entry.isDirectory) ? new DirectoryEntry(entry) : new FileEntry(entry);                
                    try {
                        successCallback(result);
                    }
                    catch (e) {
                        console.log('Error invoking callback: ' + e);
                    }         
                } 
                else {
                    // no Entry object returned
                    fail(FileError.NOT_FOUND_ERR);
                }
            },
            fail = function(error) {
                LocalFileSystem.onError(error, errorCallback);
            };

        // user must specify parent Entry
        if (!parent) {
            fail(FileError.NOT_FOUND_ERR);
            return;
        }

        // copy
        PhoneGap.exec(success, fail, "File", "copyTo", [srcPath, parent.fullPath, name]);
    };

    /**
     * Return a URI that can be used to identify this entry.
     * 
     * @param mimeType
     *            {DOMString} for a FileEntry, the mime type to be used to
     *            interpret the file, when loaded through this URI.
     * @param successCallback
     *            {Function} called with the new Entry object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    Entry.prototype.toURI = function(mimeType, successCallback, errorCallback) {
        // fullPath attribute contains the full URI on BlackBerry
        return this.fullPath;
    };    

    /**
     * Remove a file or directory. It is an error to attempt to delete a
     * directory that is not empty. It is an error to attempt to delete a
     * root directory of a file system.
     * 
     * @param successCallback {Function} called with no parameters
     * @param errorCallback {Function} called with a FileError
     */
    Entry.prototype.remove = function(successCallback, errorCallback) {
        var path = this.fullPath,
            // directory contents
            contents = [];
        
        // file
        if (blackberry.io.file.exists(path)) {
            try {
                blackberry.io.file.deleteFile(path);
                if (typeof successCallback === "function") {
                    successCallback();
                }                
            }
            catch (e) {
                // permissions don't allow
                LocalFileSystem.onError(FileError.INVALID_MODIFICATION_ERR, errorCallback);                
            }
        }
        // directory
        else if (blackberry.io.dir.exists(path)) {
            // it is an error to attempt to remove the file system root
            if (LocalFileSystem.isFileSystemRoot(path)) {
                LocalFileSystem.onError(FileError.NO_MODIFICATION_ALLOWED_ERR, errorCallback);
            }
            else {
                // check to see if directory is empty
                contents = blackberry.io.dir.listFiles(path);
                if (contents.length !== 0) {
                    LocalFileSystem.onError(FileError.INVALID_MODIFICATION_ERR, errorCallback);
                }
                else {
                    try {
                        // delete
                        blackberry.io.dir.deleteDirectory(path, false);
                        if (typeof successCallback === "function") {
                            successCallback();
                        }
                    }
                    catch (e) {
                        // permissions don't allow
                        LocalFileSystem.onError(FileError.NO_MODIFICATION_ALLOWED_ERR, errorCallback);
                    }
                }
            }
        }
        // not found
        else {
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };

    /**
     * Look up the parent DirectoryEntry of this entry.
     * 
     * @param successCallback {Function} called with the parent DirectoryEntry object
     * @param errorCallback {Function} called with a FileError
     */
    Entry.prototype.getParent = function(successCallback, errorCallback) {
        var that = this;
        
        try {
            // On BlackBerry, the TEMPORARY file system is actually a temporary 
            // directory that is created on a per-application basis.  This is
            // to help ensure that applications do not share the same temporary
            // space.  So we check to see if this is the TEMPORARY file system
            // (directory).  If it is, we must return this Entry, rather than
            // the Entry for its parent.
            window.requestFileSystem(LocalFileSystem.TEMPORARY, 0,
                    function(fileSystem) {                        
                        if (fileSystem.root.fullPath === that.fullPath) {
                            successCallback(fileSystem.root);
                        }
                        else {
                            window.resolveLocalFileSystemURI(
                                    blackberry.io.dir.getParentDirectory(that.fullPath), 
                                    successCallback, 
                                    errorCallback);
                        }
                    },
                    function (error) {
                        LocalFileSystem.onError(error, errorCallback);
                    });
        } 
        catch (e) {
            // FIXME: need a generic error code
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };
    
    return Entry;
}());

/**
 * Represents a directory on the local file system.
 */
var DirectoryEntry = DirectoryEntry || (function() {
    /**
     * Represents a directory on the local file system.
     */
    function DirectoryEntry(entry) {
        DirectoryEntry.__super__.constructor.apply(this, arguments);
    };
    
    // extend Entry
    PhoneGap.extend(DirectoryEntry, Entry);
    
    /**
     * Create or look up a file.
     * 
     * @param path {DOMString}
     *            either a relative or absolute path from this directory in
     *            which to look up or create a file
     * @param options {Flags}
     *            options to create or exclusively create the file
     * @param successCallback {Function}
     *            called with the new FileEntry object
     * @param errorCallback {Function}
     *            called with a FileError object if error occurs
     */
    DirectoryEntry.prototype.getFile = function(path, options, successCallback, errorCallback) {
            // create file if it doesn't exist
        var create = (options && options.create === true) ? true : false,
            // if true, causes failure if create is true and path already exists
            exclusive = (options && options.exclusive === true) ? true : false,
            // file exists
            exists,
            // create a new FileEntry object and invoke success callback
            createEntry = function() {
                var path_parts = path.split('/'),
                    name = path_parts[path_parts.length - 1],
                    fileEntry = new FileEntry({name: name, 
                        isDirectory: false, isFile: true, fullPath: path});
                
                // invoke success callback
                if (typeof successCallback === 'function') {
                    successCallback(fileEntry);
                }
            };

        // determine if path is relative or absolute
        if (!path) {
            LocalFileSystem.onError(FileError.ENCODING_ERR, errorCallback);
            return;
        }
        else if (path.indexOf(this.fullPath) !== 0) {
            // path does not begin with the fullPath of this directory
            // therefore, it is relative
            path = this.fullPath + '/' + path;
        }

        // determine if file exists
        try {
            // will return true if path exists AND is a file
            exists = blackberry.io.file.exists(path);
        }
        catch (e) {
            // invalid path
            LocalFileSystem.onError(FileError.ENCODING_ERR, errorCallback);
            return;
        }
        
        // path is a file
        if (exists) {
            if (create && exclusive) {
                // can't guarantee exclusivity
                LocalFileSystem.onError(FileError.PATH_EXISTS_ERR, errorCallback);                
            }
            else {
                // create entry for existing file
                createEntry();                
            }
        }
        // will return true if path exists AND is a directory
        else if (blackberry.io.dir.exists(path)) {
            // the path is a directory
            LocalFileSystem.onError(FileError.TYPE_MISMATCH_ERR, errorCallback);
        }
        // path does not exist, create it
        else if (create) {
            // create empty file
            navigator.fileMgr.write(path, "", 0,
                function(result) {
                    // file created
                    createEntry();
                },
                function(error) {
                    // unable to create file
                    LocalFileSystem.onError(error, errorCallback);
                });
        }
        // path does not exist, don't create
        else {
            // file doesn't exist
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }   
    };    

    /**
     * Creates or looks up a directory.
     * 
     * @param path
     *            {DOMString} either a relative or absolute path from this
     *            directory in which to look up or create a directory
     * @param options
     *            {Flags} options to create or exclusively create the
     *            directory
     * @param successCallback
     *            {Function} called with the new DirectoryEntry
     * @param errorCallback
     *            {Function} called with a FileError
     */
    DirectoryEntry.prototype.getDirectory = function(path, options, successCallback, errorCallback) {
            // create directory if it doesn't exist
        var create = (options && options.create === true) ? true : false,
            // if true, causes failure if create is true and path already exists
            exclusive = (options && options.exclusive === true) ? true : false,
            // directory exists
            exists,
            // create a new DirectoryEntry object and invoke success callback
            createEntry = function() {
                var path_parts = path.split('/'),
                    name = path_parts[path_parts.length - 1],
                    dirEntry = new DirectoryEntry({name: name, 
                        isDirectory: true, isFile: false, fullPath: path});
            
                // invoke success callback
                if (typeof successCallback === 'function') {
                    successCallback(dirEntry);
                }
            };
            
        // determine if path is relative or absolute
        if (!path) {
            LocalFileSystem.onError(FileError.ENCODING_ERR, errorCallback);
            return;
        } 
        else if (path.indexOf(this.fullPath) !== 0) {
            // path does not begin with the fullPath of this directory
            // therefore, it is relative
            path = this.fullPath + '/' + path;
        }
        
        // determine if directory exists
        try {
            // will return true if path exists AND is a directory
            exists = blackberry.io.dir.exists(path);
        }
        catch (e) {
            // invalid path
            LocalFileSystem.onError(FileError.ENCODING_ERR, errorCallback);
            return;
        }
        
        // path is a directory
        if (exists) {
            if (create && exclusive) {
                // can't guarantee exclusivity
                LocalFileSystem.onError(FileError.PATH_EXISTS_ERR, errorCallback);                
            }
            else {
                // create entry for existing directory
                createEntry();                
            }
        }
        // will return true if path exists AND is a file
        else if (blackberry.io.file.exists(path)) {
            // the path is a file
            LocalFileSystem.onError(FileError.TYPE_MISMATCH_ERR, errorCallback);
        }
        // path does not exist, create it
        else if (create) {
            try {
                // directory path must have trailing slash
                var dirPath = path;
                if (dirPath.substr(-1) !== '/') {
                    dirPath += '/';
                }
                blackberry.io.dir.createNewDir(dirPath);
                createEntry();
            }
            catch (e) {
                // unable to create directory
                LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);                
            }
        }
        // path does not exist, don't create
        else {
            // directory doesn't exist
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }             
    };

    /**
     * Delete a directory and all of it's contents.
     * 
     * @param successCallback {Function} called with no parameters
     * @param errorCallback {Function} called with a FileError
     */
    DirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
        // we're removing THIS directory
        var path = this.fullPath;
            
        // attempt to delete directory
        if (blackberry.io.dir.exists(path)) {
            // it is an error to attempt to remove the file system root
            if (LocalFileSystem.isFileSystemRoot(path)) {
                LocalFileSystem.onError(FileError.NO_MODIFICATION_ALLOWED_ERR, errorCallback);
            }
            else {
                try {
                    // delete the directory, setting recursive flag to true
                    blackberry.io.dir.deleteDirectory(path, true);
                    if (typeof successCallback === "function") {
                        successCallback();
                    }
                } catch (e) {
                    // permissions don't allow deletion
                    console.log(e);
                    LocalFileSystem.onError(FileError.NO_MODIFICATION_ALLOWED_ERR, errorCallback);
                }
            }
        }
        // it's a file, not a directory
        else if (blackberry.io.file.exists(path)) {
            LocalFileSystem.onError(FileError.TYPE_MISMATCH_ERR, errorCallback);
        }
        // not found
        else {
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
        }
    };

    /**
     * An interface that lists the files and directories in a directory.
     */
    function DirectoryReader(path) {
        this.path = path || null;
    };
    
    /**
     * Creates a new DirectoryReader to read entries from this directory
     */
    DirectoryEntry.prototype.createReader = function() {
        return new DirectoryReader(this.fullPath);
    };
    
    /**
     * Reads the contents of the directory.
     * @param successCallback {Function} called with a list of entries
     * @param errorCallback {Function} called with a FileError
     */
    DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
        var path = this.path,    
            // process directory contents
            createEntries = function(array) {
                var entries, entry, num_entries, i, name, result = [];
                
                // get objects from JSONArray
                try {
                    entries = JSON.parse(array);
                } 
                catch (e) {
                    console.log('unable to parse JSON: ' + e);
                    LocalFileSystem.onError(FileError.SYNTAX_ERR, errorCallback);
                    return;
                }

                // append file separator to path
                if (/\/$/.test(path) === false) {
                    path += '/';
                }

                // create FileEntry or DirectoryEntry object for each listing
                for (i = 0, num_entries = entries.length; i < num_entries; i += 1) {
                    name = entries[i];

                    // if name ends with '/', it's a directory
                    if (/\/$/.test(name) === true) {
                        // trim file separator
                        name = name.substring(0, name.length - 1); 
                        entry = new DirectoryEntry({
                            name: name,
                            fullPath: path + name,
                            isFile: false,
                            isDirectory: true
                        });
                    }
                    else {
                        entry = new FileEntry({
                            name: name,
                            fullPath: path + name,
                            isFile: true,
                            isDirectory: false
                        });
                    }
                    result.push(entry);
                }
                try {
                    successCallback(result);
                } 
                catch (e) {
                    console.log("Error invoking callback: " + e);
                }
            };        
        
        // sanity check
        if (!blackberry.io.dir.exists(path)) {
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);
            return;
        }
        
        // list directory contents
        PhoneGap.exec(createEntries, errorCallback, "File", "readEntries", [path]);
    };

    return DirectoryEntry;
}());

/**
 * Represents a file on the local file system.
 */
var FileEntry = FileEntry || (function() {
    /**
     * Represents a file on the local file system.
     */
    function FileEntry(entry) {
        FileEntry.__super__.constructor.apply(this, arguments);
    };
    
    // extend Entry
    PhoneGap.extend(FileEntry, Entry);
    
    /**
     * Creates a new FileWriter associated with the file that this FileEntry
     * represents.
     * 
     * @param successCallback
     *            {Function} called with the new FileWriter
     * @param errorCallback
     *            {Function} called with a FileError
     */
    FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
        var writer;

        // create a FileWriter using a File object for this entry
        this.file(function(file) {
            try {
                writer = new FileWriter(file);
                successCallback(writer);
            } 
            catch (e) {
                console.log("Error invoking callback: " + e);
            }            
        }, errorCallback);
    };

    /**
     * Returns a File that represents the current state of the file that this
     * FileEntry represents.
     * 
     * @param successCallback
     *            {Function} called with the new File object
     * @param errorCallback
     *            {Function} called with a FileError
     */
    FileEntry.prototype.file = function(successCallback, errorCallback) {
        var properties, file;

        // check that file still exists
        if (blackberry.io.file.exists(this.fullPath)) {
            // get file properties
            properties = blackberry.io.file.getFileProperties(this.fullPath);
            file = new File();
            file.name = this.name;
            file.fullPath = this.fullPath;
            file.type = properties.mimeType;
            file.lastModifiedDate = properties.dateModified; 
            file.size = properties.size;
            
            try {
                successCallback(file);
            }
            catch (e) {
                console.log("Error invoking callback: " + e);            
            }            
        }
        // entry is a directory
        else if (blackberry.io.dir.exists(this.fullPath)) {
            LocalFileSystem.onError(FileError.TYPE_MISMATCH_ERR, errorCallback);
        }
        // entry has been deleted
        else {
            LocalFileSystem.onError(FileError.NOT_FOUND_ERR, errorCallback);            
        }        
    };

    return FileEntry;
}());

/**
 * An interface representing a file system
 * 
 * name {DOMString} unique name of the file system (readonly)
 * root {DirectoryEntry} directory of the file system (readonly)
 */
function FileSystem() {
    this.name = null;
    this.root = null;
};

/**
 * Information about the state of the file or directory.
 * 
 * modificationTime {Date} (readonly)
 */
function Metadata() {
    this.modificationTime = null;
};

/**
 * Supplies arguments to methods that lookup or create files and directories.
 * 
 * @param create
 *            {boolean} file or directory if it doesn't exist
 * @param exclusive
 *            {boolean} used with create; if true the command will fail if
 *            target path exists
 */
function Flags(create, exclusive) {
    this.create = create || false;
    this.exclusive = exclusive || false;
};

/**
 * Contains properties of a file on the file system.
 */
var File = (function() {
    /**
     * Constructor.
     * name {DOMString} name of the file, without path information
     * fullPath {DOMString} the full path of the file, including the name
     * type {DOMString} mime type
     * lastModifiedDate {Date} last modified date
     * size {Number} size of the file in bytes
     */
    function File() {
        this.name = null;
        this.fullPath = null;
        this.type = null;
        this.lastModifiedDate = null; 
        this.size = 0;
    };
    
    return File;
}());

/**
 * Represents a local file system.
 */
var LocalFileSystem = LocalFileSystem || (function() {
    
    /**
     * Define file system types.
     */
    var LocalFileSystem = {
        TEMPORARY: 0,    // temporary, with no guarantee of persistence
        PERSISTENT: 1    // persistent
    };
    
    /**
     * Static method for invoking error callbacks.
     * @param error FileError code
     * @param errorCallback error callback to invoke
     */
    LocalFileSystem.onError = function(error, errorCallback) {
        var err = new FileError();
        err.code = error;
        try {
            errorCallback(err);
        } 
        catch (e) {
            console.log('Error invoking callback: ' + e);
        }        
    };
    
    /**
     * Utility method to determine if the specified path is the root file 
     * system path.
     * @param path fully qualified path
     */
    LocalFileSystem.isFileSystemRoot = function(path) {
        return PhoneGap.exec(null, null, "File", "isFileSystemRoot", [path]);
    };
    
    /**
     * Request a file system in which to store application data.
     * @param type  local file system type
     * @param size  indicates how much storage space, in bytes, the application expects to need
     * @param successCallback  invoked with a FileSystem object
     * @param errorCallback  invoked if error occurs retrieving file system
     */
    var _requestFileSystem = function(type, size, successCallback, errorCallback) {
            // if successful, return a FileSystem object
        var success = function(file_system) {
            var result;

                if (file_system) {
                    // grab the name from the file system object
                    result = {
                        name: file_system.name || null   
                    };
                
                    // create Entry object from file system root
                    result.root = new DirectoryEntry(file_system.root);          
                    try {
                        successCallback(result);
                    }
                    catch (e) {
                        console.log('Error invoking callback: ' + e);
                    }         
                } 
                else {
                    // no FileSystem object returned
                    fail(FileError.NOT_FOUND_ERR);
                }
            },
            // error callback
            fail = function(error) {
                LocalFileSystem.onError(error, errorCallback);
            };
            
        PhoneGap.exec(success, fail, "File", "requestFileSystem", [type, size]);
    };
    
    /**
     * Look up file system Entry referred to by local URI.
     * @param {DOMString} uri  URI referring to a local file or directory 
     * @param successCallback  invoked with Entry object corresponding to URI
     * @param errorCallback    invoked if error occurs retrieving file system entry
     */
    var _resolveLocalFileSystemURI = function(uri, successCallback, errorCallback) {
        // if successful, return either a file or directory entry
        var success = function(entry) {
            var result; 

            if (entry) {
                // create appropriate Entry object
                result = (entry.isDirectory) ? new DirectoryEntry(entry) : new FileEntry(entry);                
                try {
                    successCallback(result);
                }
                catch (e) {
                    console.log('Error invoking callback: ' + e);
                }         
            } 
            else {
                // no Entry object returned
                fail(FileError.NOT_FOUND_ERR);
            }
        };

        // error callback
        var fail = function(error) {
            LocalFileSystem.onError(error, errorCallback);
        };
        PhoneGap.exec(success, fail, "File", "resolveLocalFileSystemURI", [uri]);
    };    

    /**
     * Add the FileSystem interface into the browser.
     */
    PhoneGap.addConstructor(function() {
        if(typeof window.requestFileSystem === "undefined") {
            window.requestFileSystem  = _requestFileSystem;
        }
        if(typeof window.resolveLocalFileSystemURI === "undefined") {
            window.resolveLocalFileSystemURI = _resolveLocalFileSystemURI;
        }
    });

    return LocalFileSystem;
}());
