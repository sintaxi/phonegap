PhoneGap implementation for Google Android
==========================================


Install SDK + PhoneGap
----------------------
1. Download and install Eclipse Classic
2. Download and install Android SDK
3. Download and install ADT Plugin
4. Download the latest copy of PhoneGap and extract its contents. We will be working with the Android directory.


Setup New Project
-----------------
1. Launch Eclipse, then under the File menu select New > Android Project
2. In the root directory of the project, create two new directories:
	- /libs
	- /assets/www
3. Copy phonegap-1.0.0.js from your PhoneGap download earlier to /assets/www
4. Copy phonegap-1.0.0.jar from your PhoneGap download earlier to /libs
5. Copy xml folder from your PhoneGap download earlier to /res 
6. Make a few adjustments too the project's main Java file found in the src folder in Eclipse:
	- Change the class's extend from Activity to DroidGap
	- Replace the setContentView() line with super.loadUrl("file:///android_asset/www/index.html");
	- Add import com.phonegap.*;
	- Remove import android.app.Activity;
You might experience an error here, where Eclipse can't find phonegap-1.0.0.jar. In this case, right click on the /libs folder and go to Build Paths/ > Configure Build Paths. Then, in the Libraries tab, add phonegap-1.0.0.jar to the Project. If Eclipse is being temperamental, you might need to refresh (F5) the project once again.
		
7. Right click on AndroidManifest.xml and select Open With > Text Editor
8. Paste the following permissions under versionName:

        <supports-screens
                android:largeScreens="true"
                android:normalScreens="true"
                android:smallScreens="true"
                android:resizeable="true"
                android:anyDensity="true"
                />
        <uses-permission android:name="android.permission.CAMERA" />
        <uses-permission android:name="android.permission.VIBRATE" />
        <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
        <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
        <uses-permission android:name="android.permission.ACCESS_LOCATION_EXTRA_COMMANDS" />
        <uses-permission android:name="android.permission.READ_PHONE_STATE" />
        <uses-permission android:name="android.permission.INTERNET" />
        <uses-permission android:name="android.permission.RECEIVE_SMS" />
        <uses-permission android:name="android.permission.RECORD_AUDIO" />
        <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
        <uses-permission android:name="android.permission.READ_CONTACTS" />
        <uses-permission android:name="android.permission.WRITE_CONTACTS" />   
        <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />  
        <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

9. Add android:configChanges="orientation|keyboardHidden" to the activity tag in AndroidManifest.

10. Now create and open a new file named index.html in the /assets/www directory. Paste the following code:
	
		<!DOCTYPE HTML>
		<html>
			<head>
				<title>PhoneGap</title>
				<script type="text/javascript" charset="utf-8" src="phonegap-1.0.0.js"></script>
			</head>
			<body>
				<h1>Hello World</h1>
			</body>
		</html>

11.  A. Deploy to Simulator
	- Right click the project and go to <strong>Run As</strong> and click <strong>Android Application</strong></li>
	- Eclipse will ask you to select an appropriate AVD. If there isn't one, then you'll need to create it.</li>


11.  B. Deploy to Device
	- Make sure USB debugging is enabled on your device and plug it into your system. (Settings > Applications > Development)
	- Right click the project and go to Run As and click Android Application		

11. Done!
	- You can also checkout more detailed version of this guide http://PhoneGap.com/start