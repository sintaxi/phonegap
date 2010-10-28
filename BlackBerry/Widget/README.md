PhoneGap BlackBerry Widget
==========================

[PhoneGap framework](http://www.phonegap.com/) for __BlackBerry OS 5.0 and 6.0__. The framework is implemented using the [BlackBerry Web Widget SDK](http://na.blackberry.com/eng/developers/browserdev/widgetsdk.jsp).

Directory Structure
-------------------

    framework/ ... BlackBerry Widget Extension (PhoneGap native code)
    js/ .......... PhoneGap JavaScript (Non-concatenated, non-minified)
    template/ .... Project template for creating a new projects

Introduction
------------

The Blackberry Widget SDK provides a framework for developing hybrid applications for Blackberry devices that support Blackberry OS 5.0 and higher.  In this framework, web applications consisting of web content, resources, and JavaScript can access device specific features through the exposed JavaScript [Blackberry Widget API](http://www.blackberry.com/developers/docs/widgetapi/).  

The Blackberry Widget API is a subset of the [native Blackberry Java API](http://www.blackberry.com/developers/docs/6.0.0api/).  A Widget application can make use of the native Java APIs by using JavaScript extensions.  Doing so provides the Widget application access to device information and capabilities that the Widget API does not provide.  It is therefore helpful to think of a Blackberry Widget application as having two parts:

1. The Widget application, consisting of HTML, CSS, JavaScript, with access to the exposed Widget APIs.
2. The JavaScript extensions, or native Java code, with access to the full native Java APIs.

The phonegap-blackberry-widget project uses both the Blackberry Widget API and JavaScript extensions.  This project will allow you to create your own Blackberry Widget applications that leverage the common PhoneGap API.

Development Options
-------------------

There are two approaches to developing a PhoneGap BlackBerry Widget:

1. Using the ANT command-line tool
    - You do not need to install Eclipse
    - You can use your favourite source code editor (even Eclipse)
    - Fast and easy to build and deploy applications
2. Eclipse environment
    - Better for developing PhoneGap plugins and Widget extensions

Running PhoneGap BlackBerry Widgets from the Command-line
=========================================================

Requirements
------------

1. Windows XP and Windows 7 (32-bit and 64-bit)
2. [Sun Java Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/index.html#jdk), version 1.6 (32-bit)
3. [BlackBerry Widget SDK](http://na.blackberry.com/eng/developers/browserdev/widgetsdk.jsp)
4. [Apache ANT](http://ant.apache.org/)

Installing Apache ANT
---------------------

1. [Download ANT](http://ant.apache.org/bindownload.cgi)
2. Extract to a desired installation directory, e.g. C:\apache-ant
3. Set ANT_HOME
    1. Open _System Properties_ -> _Advanced_ -> _Environment Variables_
    2. Create a new system variable
        - Variable name: ANT_HOME
        - Variable value: C:\apache-ant
4. Add ANT_HOME to PATH
    1. Open _System Properties_ -> _Advanced_ -> _Environment Variables_
    2. Under system variables, edit PATH
        - Add `;%ANT_HOME%\bin` to the end of the PATH value.
        - e.g. %SystemRoot%\system32;%SystemRoot%;%JAVA_HOME%\bin;%ANT_HOME%\bin
5. Verify that ANT is installed
    1. Open your command-line tool (cmd.exe or cygwin.exe)

            $ ant -v
            Apache Ant version 1.8.1 compiled on April 30 2010
            Trying the default build file: build.xml
            Buildfile: build.xml does not exist!
            Build failed

Installing PhoneGap-BlackBerry-Widget Framework
-----------------------------------------------

    $ cd C:\some\path\
    $ git clone git://github.com/phonegap/phonegap-blackberry-widget.git
    $ cd phonegap-blackberry-widget
    $ ant help

Creating a New PhoneGap Project
-------------------------------

Each project contains the PhoneGap framework and so the project is independent of the phonegap-blackberry-widget source code.

This allows you to easily distribute the project to other BlackBerry widget developers.

    $ cd phonegap-blackberry-widget
    $ ant help
    
    $ ant create -Dproject.path="C:\development\my_new_project"
    
    $ cd C:\development\my_new_project
    $ ant help

For each project, you need to tell ANT where you have installed the BlackBerry Widget SDK. You can do this by editing __project.properties__ in the project directory.

    [edit project.properties]

Building and Deploying a Project
--------------------------------

    $ cd C:\development\my_new_project
    $ ant help
    
    $ ant load-simulator
    
    $ ant load-device

Updating the PhoneGap Framework
-------------------------------

    $ cd phonegap-blackberry-widget
    $ git pull origin master

    $ ant update -Dproject.path="C:\development\my_new_project"

Debugging a Widget
------------------

The Eclipse BlackBerry Widget Plugin has some powerful debugging options, such as settings breakpoints in JavaScript. In order to use these features, you must import your source code into a BlackBerry Widget project.

### Install Eclipse and the BlackBerry Widget Plugin

Follow in the installation instructions under the section __Running PhoneGap BlackBerry Widgets from Eclipse__.

### Import your BlackBerry Widget Project into Eclipse

1. Create a BlackBerry Widget project:
    1. _File_ -> _New_ -> _BlackBerry Widget Project_
        - Project Name: MyNewProject
        - Start Page: index.html
2. Import the project:
	1. In the project tree, right-click on the widget project (MyNewProject) and select _Import..._
	2. Select _General_ -> _Filesystem_
	3. Select _Browse..._
	4. Add the _www/_ directory of your project
	    - e.g. C:\development\my_new_project\www
	5. Check the _www/_ directory
	6. Select _Finish_
	7. Select _Yes_ to overwrite the existing index.html and config.xml

Running PhoneGap BlackBerry Widgets from Eclipse
================================================

Overview
--------

It is best to setup two projects in Eclipse: a Java project for the Widget Extension native Java code, and a Blackberry Widget project for the web application code and resources.

Requirements
------------

1. Windows XP and Windows 7 (32-bit and 64-bit)
2. [Sun Java Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/index.html#jdk), version 1.6 (32-bit)
3. [Eclipse 3.5+](http://www.eclipse.org/downloads/), the Classic Eclipse package is fine
4. [BlackBerry Web Plugin for Eclipse](http://na.blackberry.com/eng/developers/browserdev/eclipseplugin.jsp)

Installing PhoneGap-BlackBerry-Widget Framework
-----------------------------------------------

    $ cd C:\some\path\
    $ git clone git://github.com/phonegap/phonegap-blackberry-widget.git

Installing the Eclipse BlackBerry Web Plugin
--------------------------------------------

1. Open Eclipse
2. _Help_ -> _Install New Software..._ -> _Click Add..._
	- Name: Blackberry Update - Web
	- Location: http://www.blackberry.com/go/eclipseUpdate/3.5/web
3. Select __Blackberry Web Plugin__ and __Blackberry Widget SDK__
	- Note: Even if the standalone Widget SDK is already installed on your system, you must install the Widget plugin to enable Blackberry Widget project capabilities within Eclipse.
4. Restart Eclipse

Create Eclipse Project for Extension Development
------------------------------------------------

1. Create a Java project
	1. _File_ -> _New_ -> _Project..._ -> _Java Project_
		- Project Name: PhoneGapBlackberryExtension
		    - Do NOT use special characters or whitespace in Blackberry Widget project names, as the RAPC compiler will choke on them.
		- _JRE_ -> _Use a project specific JRE: Blackberry JRE 5.0.0_
2. Import the phonegap extension code
	1. Select the PhoneGapBlackberryExtension project
	2. _File_ -> _Import_ -> _phonegap-blackberry-widget/framework/ext_

Create a New Eclipse Widget Project
-----------------------------------

1. Create a BlackBerry Widget project
    1. _File_ -> _New_ -> _BlackBerry Widget Project_
        - Project Name: PhoneGapBlackberryWidget
        - Start Page: index.html
2. Import the PhoneGap widget code
	1. In the project tree, right-click on the widget project and select _Import..._
	2. Select _General_ -> _Filesystem_
	3. Import _phonegap-blackberry-widget/www_
	4. Select _config.xml_ and _index.html_
	5. Select _ext_ and _javascript_ folders
3. Change PhoneGap widget name
	1. Open _config.xml_
	2. Click _Overview_ tab
		- Name: PhoneGap Widget
4. Build the widget
    1. Select the project, right-click and select _Build and Sign BlackBerry Widget Project_
5. Run the widget
    1. Select the project, right-click and select _Run_ -> _Run as_ -> _Blackberry Simulator_

Troubleshooting
---------------

__Q: I uploaded my application to the BlackBerry device, but it will not open or run.__

__A:__ Try hard resetting the device by pressing and hold ALT + CAPS LOCK + DEL. You must press and hold each key in sequence and not all at once.

__Q: My simulator screen is not refreshing and I see blocks on a clicked position.__

__A:__ Windows 7 and the simulator's graphics acceleration do not mix. On the simulator, set View -> Graphics Acceleration to Off.

__Q: When I use the PhoneGap [Camera.getPicture API](http://docs.phonegap.com/phonegap_camera_camera.md.html#camera.getPicture) on my device, the camera never returns to my application.  Why does this happen?__

__A:__ PhoneGap uses a JavaScript extension to invoke the native camera application so the user can take a picture.  When the picture is taken, PhoneGap will close the native camera application by emulating key injections (like pressing the back button).  On a physical device, users will have to set permissions to allow your application to allow key injections to take place.  Setting application permissions is device-specific.  On a Storm2 (9550), for example,  select the Blackberry button from the Home screen to get to All Applications screen, then Options > Applications > Your Application.  Then select Edit Default Permissions > Interactions > Input Simulation and set it to 'Allow'.  Save your changes.