### iOS ###

* CB-5199 - Media Capture - UI issues under iOS 7 (uncrustify style fix-ups as well)
* CB-5189 - ios - Backport of v2.9.1 - add CoreMotion.framework to the default template
* CB-5189 - ios - Backport of v2.9.1 from CB-4825, CB-5035 (Device Motion / Accelerometer)
* CB-5189 - ios - Backport of v2.9.1 from CB-4847 (Media only)
* CB-5189 - ios - Backport of v2.9.1 from CB-4847 (Media Capture only)
* CB-5189 - ios - Backport for v2.9.1 of CB-4806, CB-4355 (Splashscreen)
* CB-5189 - ios - Backport for v2.9.1 of CB-4930 (InAppBrowser)
* CB-5189 - ios - Backport for v2.9.1 of CB-4958, CB-3482 and CB-3453 changes
* [CB-4480] Using 64 bit ints to store file size
* [CB-3448] bin/diagnose_project script fails if CORDOVALIB variable not in prefs plist
* [CB-3567] Redirect initiated in JavaScript fails the app from loading
* [CB-4147] Fixing crash when calling show() on an already open InAppBrowser window.
* [CB-4104] Made config parameters case-insensitive.
* [CB-4033] Relaxed case-sensitivity of "UTF-8".
* [CB-4037] Unable to Archive iOS projects for upload to App Store in 2.9
* [CB-4025] iOS emulate command broken when run inside the cordova folder


### Android ###

* Set VERSION to 2.9.1 (via coho)
* Update JS snapshot to version 2.9.1 (via coho)
* CB-5193 Fix Android WebSQL sometime throwing SECURITY_ERR.
* Move java files back into api/ directory.
* [CB-4817] Remove unused assets in project template.
* Update JS snapshot and VERSION to 2.9.1-dev
* Update InAppBrowser.java to cordova-plugin-inappbrowser@aa81c3267a5b1c337b09933ff5ceb06a93f9dbb7
* Update snapshot of CameraLauncher.java to cordova-plugin-camera@703f6c68d830d41f9de56c4da57dfbc9aef
* Update snapshot of FileTransfer.java to
* CB-5080 Find resources in a way that works with aapt's --rename-manifest-package (cherry picked fro
* Tweak the online bridge to not send excess online events.
* [CB-4495] Modify start-emulator script to exit immediately on a fatal emulator error. (cherry picke
* Log WebView IOExceptions only when they are not 404s (cherry picked from commit 5451320350f8a814e3d
* Fix data URI decoding in CordovaResourceApi
* [CB-4466] fixed jscript check_reqs to get target from project.properties (cherry picked from commit
* [CB-4463] Updated bin/check_reqs to looks for android-18 target.Also fixed an issue in unix version
* [CB-4198] bin/create script should be better at handling non-word characters in activity name. Patc
* [CB-4198] bin/create should handle spaces in activity better.
* [CB-3384] Fix thread assertion when plugins remap URIs (cherry picked from commit b915aafb5be319121
* [CB-3384] Use the ExposedJsApi to detect webCore thread instead of IceCreamCordovaWebViewClient.
* Prevent NPE in case webview is lately initialized (cherry picked from commit a9ebf50b86bcb9de40cbf4
* [CB-3384] Reworked UriResolver into CordovaResourceApi.
* [CB-3384] Add a length getter for UriResolver. Change from interface -> abstract class.
* Let subclasses override focus behavior
* [CB-3384] Make UriResolver assert that IO is not on the UI nor WebCore threads.
* Backporting CB-1605
* CB-4471: Mitigating Android 4.3 errors where data isn't being passed so NPE doesn't happen
* Backporting CB-4521
* Backporting FileUtils fixes to 2.9
* Updating cordova.js to be up-to-date
* CB-4633: Backporting to Android 2.9.x
* CB-4498: Updating 2.9.x to minimum supported
* [CB-4013] Added a missing import.
* CB-4465: Supporting 2.9.x for a period of time
* [CB-4013] Fixed loadUrlTimeoutValue preference.
* [CB-4140] Fix version of cordova-android to 2.9.0
* CB-4155: Cordova Android - navigator.app.clearCache(); is called on (prospectively unsupported) Web
* [CB-4103] Made config parameters case-insensitive.
* [CB-4038] Move non-deprecated classes from the api package into the main package. (cherry picked fr
* [CB-3384] Rewrite of DataResource into UriResolver + UriResolvers
* Fixes to the update command so it doesn't delete anything other than build artifacts
* Remove accidentally checked in log statement "running exec normally"
* Explicitly print exceptions that occur within ExposedJsApi.
* [CB-3998] video duration is an int
* [CB-3927] Fix start-up race condition that could cause exec() responses to be dropped.
* Accidentally commented "build" out when running ./run --emulator. Whoops D:
* Remove PluginManager.exec's return value (unused).
* CB-3949: Adding code to mitigate broken intents with the application installer
* Update JS snapshot to version 2.9.0rc1 (via coho)
* CB-3854: Added support for wildcard.  This probably could be improved, but it does work
* CB-3854: Added support for wildcard.  This probably could be improved, but it does work
* CB-3932 Remove baseUrl comment in handleDestroy method made redundant by CB-3766
* CB-3902: Explicitly add market URIs to CordovaWebViewClient so this always works, not just sometime
* [CB-3625] [CB-3338] updated windows cli scripts and added version option
* CB-3784: Patches are always welcome
* [CB-3998] video duration is an int

### WP7 & WP8 ###

* support namespace, and deprecated plugin tags in config.xml
* Update File.write method with additional params
* bumped version to 2.9.1 and removed dupe geolocation from config.xml for wp7+8 [CB-4090]
* [CB-4090] Broken notification handling
* update templates to include all plugins for 2.9.1
* update cordova.js for 2.9.1
* Fix null reference exception
* update Audio/Media plugins
* add callback id to compass callbacks
* add callback id to callbacks
* update FileTransfer plug from plugin repo
* add plugns back, and remove dupe classes
* update version to 2.9.1

### Windows 8 ###

* update cordova.js to 2.9.1

### BlackBerry ###

* No changes from 2.9.0
