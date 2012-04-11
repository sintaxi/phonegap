DISCLAIMER: THIS IMPLEMENTATION DOES NOT WORK WITH THE BADA 2.x SDK. ONLY 1.2 is supported BY THIS IMPLEMENTATION!

Cordova implementation for Samsung Bada
========================================

Support for: Acceleration, Geolocation (native and browser), Network, Device, Compass, Camera

Missing support: File

Steps to build a Cordova app
-----------------------------
1. Download Source Code (clone the repository)
2. Import in bada C++ IDE
3. Put your HTML/CSS files in the Res/ folder
4. Run cordova.bat under Res/cordova directory
5. Build&Run!

Runnning in the simulator
-------------------------

1. Right click on your project and select Build Configuration => Set Active => Simulator Debug in the Bada IDE
2. Build&Run

Running on a target device
--------------------------

1. Follow [instructions](http://bit.ly/dK44XJ)
2. Generate a new app on developer.bada.com, download the manifest.xml file and put it in the root dir of your app (overwritting the existing one).
3. Right click on your project and select Build configuration => Set Active => Target Debug in the Bada IDE
4. Build&Run

Known Issues with target devices:
=================================

### Issue 1
Console shows ERROR and app doesn't install and run

Install [Samsung Kies](http://bit.ly/hERlsu) that somehow updates the drivers and makes it magically work.

### Issue 2
Target already launched
Make sure it is not already launched :) Click on console and press the red square and/or quit the app from the phone
If it is but you still get the error message, close and restart the Bada IDE.

### KNOWN ISSUE
alerts in callbacks freeze the application. DO NOT USE ALERT DIALOGS IN YOUR CALLBACKS

Happy Coding!
