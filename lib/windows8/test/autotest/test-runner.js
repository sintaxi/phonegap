if (window.sessionStorage != null) {
    window.sessionStorage.clear();
}

// Timeout is 2 seconds to allow physical devices enough
// time to query the response. This is important for some
// Android devices.
var Tests = function() {};
Tests.TEST_TIMEOUT = 7500;
