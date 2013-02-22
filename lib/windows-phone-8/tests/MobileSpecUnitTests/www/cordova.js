var VERSION='2.5.0';
var scripts = document.getElementsByTagName('script');
var cordovaPath = scripts[scripts.length - 1].src.replace('cordova.js', 'cordova-'+VERSION+'.js');

document.write('<script type="text/javascript" charset="utf-8" src="' + cordovaPath + '"></script>');

function backHome() {
	if (window.device && device.platform && device.platform.toLowerCase() == 'android') {
            navigator.app.backHistory();
	}
	else {
	    window.history.go(-1);
	}
}
