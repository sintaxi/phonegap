document.write('<script type="text/javascript" charset="utf-8" src="../../cordova-1.6.1.js"></script>');
document.write('<script type="text/javascript" charset="utf-8" src="../cordova-1.6.1.js"></script>');
document.write('<script type="text/javascript" charset="utf-8" src="cordova-1.6.1.js"></script>');

function backHome() {
	
	if (window.device && device.platform && device.platform.toLowerCase() == 'android') {
            navigator.app.backHistory();
	}
	else {
	    window.history.go(-1);
	}
}
