// Prevent QUnit from running when the DOM load event fires
QUnit.config.autostart = false;
sessionStorage.clear();

var Tests = function() {
    this.TEST_TIMEOUT = 500;
};

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('deviceready', function() {
        var tests = new Tests();

        // Each group of tests are declared as a function in the object `Tests`.
        // A group of tests are identified by a name that contains the word 'Tests'.
        //
        // Load each group of tests into QUnit
        for (var t in tests) {
            if (t.indexOf('Tests') > -1) {
                tests[t]();
            }
        }
        
        // Start the QUnit test suite
        QUnit.start();
    }, false);
}, false);
