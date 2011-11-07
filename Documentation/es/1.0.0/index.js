//
// Google Analytics
//
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-94271-11']);
_gaq.push(['_setDomainName', '.phonegap.com']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

//
// Syntax Highlighting
//
(function() {
    window.addEventListener('load', function() {
        prettyPrint();
    }, false);
})();

//
// Version and Language <select>
//
(function() {
    window.addEventListener('load', function() {
        document.getElementById('header').getElementsByTagName('select')[0].addEventListener('change', function(e) {
            var $select     = this.options[this.selectedIndex];
            var version     = $select.value;
            var language    = $select.parentElement.getAttribute('value');
            var currentFile = (window.location.href.match(/\/[^\/]*$/) || ['/index.html'])[0];

            // Uncomment to also jump to the same page. However, the server should handle missing page
            // window.location.href = '../../' + language + '/' + version + currentFile;
            window.location.href = '../../' + language + '/' + version + '/index.html';
        }, false);
    }, false);
})();

//
// API <select>
//
(function() {
    window.addEventListener('load', function() {
        var $select = document.getElementById('subheader').getElementsByTagName('select')[0];
        if (!$select) return;
        
        $select.addEventListener('change', function(e) {
            document.location = '#' + this.options[this.selectedIndex].value;
        }, false);
    }, false);
})();
