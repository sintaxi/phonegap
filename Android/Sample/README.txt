Get started with Eclipse
===

1. File > New > Project...
2. Android Project
3. Create from existing source
4. point to this folder
5. select highest build target (you should have 2.2 installed)
6. finish
7. right click on libs/phonegap.jar and add to build path
8. Run as Android Project

Get started with the command line
===

1. create local.properties with the android command line tool

$ android update project -p . 

2. ensure an emulator or device is plugged in 

$ ant debug install && adb logcat


