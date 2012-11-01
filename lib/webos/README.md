Cordova webOS
=====================================================
Cordova webOS is a skeleton HP webOS application, along with JavaScript wrapper libraries, which allow a developer to build an application for an HP webOS device using web technologies. This same code can be built for iPhone, BlackBerry, Symbian, and more to come ...

Pre-requisites
-----------------------------------------------------
You should have VirtualBox (virtual machine software which runs the Palm emulator) and the webOS SDK installed. Both of these can be found at [Palm's Developer Site](https://developer.palm.com/content/resources/develop/sdk_pdk_download.html).

Set up your environment and install the skeleton app
-----------------------------------------------------
Open a terminal, and navigate to the root Cordova webOS folder (where this readme.md file is located). A Makefile resides here; running make here will package your application, and install it to either the emulator, or the device. Or you can run make on individual target tasks:

   - `make copy_js` - copies libs/Cordova.js to framework/Cordova.js - modify this path if you want Cordova.js in another location
   - `make package` - builds the webOS app (located in framework/) into an webOS .ipk installer package in the Cordova_root/palm/ folder
   - `make deploy` - installs the .ipk package to a device if detected, otherwise the emulator if its running 

If a connected webOS device is detected, the application will be installed to the device. If not, and the emulator is running, the application will be installed to the emulator. To run the emulator, search for Palm Emulator.app in the finder, and run it. 


Build your Cordova app
-----------------------------------------------------
Navigate to `Cordova_root/webOS_new/framework/`; this is where your application will reside. If you have already built a Cordova application on another platform, drop your html,js, css and assets into this folder (starting with the required index.html). Don't forget Cordova.js!

Just open framework/ in your favourite editor, build your web app, and run the appropriate make command indicated above. Edit appinfo.json to set your app id (see Notes below), version, etc.

Cordova-webOS doesn't need to do any native initialization, but it does fire a `deviceready` that guarantees all the Cordova APIs are in place. You can run your code at `deviceready` like so:

    document.addEventListener('deviceready', function() {
        // do cool Cordova things
    }, false);

To enable a javascript debug console, open a new terminal window and type:
    Cordova-log app_id
Where the app id is your app id as set in `appinfo.json`
This will tail your log file; it will default to the device if detected, otherwise it will read logs from the emulator.
To log from your JS code, use `console.log`

Notes & Caveats
-----------------------------------------------------
 - In order to use the vibration API on webOS, your application needs to have a "com.palm.*" namespace, as vibration on webOS is a private API. The caveat of doing this is that you are essentially indicating that your app should pretend to be a "Palm app" (rather than a Nitobi app, for example) ... and as a result your app will be denied from the App Catalog.
 - If using Lawnchair, the only supported adaptor is webkitsqlite.
 - html select boxes are implemented by Cordova, not supported natively (believe it or not). only the most basic functionality is implemented, so be aware using this control could cause problems.
 - To enable verbose logging, add the file framework_config.json to your framework/www/ folder, containing the following json content: { "logLevel": 99 }


Helpful Links
-----------------------------------------------------
  - Cordova Wiki: 				[wiki.apache.org/cordova](http://wiki.apache.org/cordova/)
  - HP webOS developer site: 	[developer.palm.com](http://developer.palm.com)
