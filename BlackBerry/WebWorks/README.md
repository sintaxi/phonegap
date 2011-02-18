PhoneGap BlackBerry WebWorks
============================

[PhoneGap framework](http://www.phonegap.com/) for __BlackBerry OS 5.0 and 6.0__. The framework is implemented using the [BlackBerry WebWorks SDK](http://us.blackberry.com/developers/browserdev/widgetsdk.jsp).

Directory Structure
-------------------

    framework/ ... BlackBerry WebWorks JavaScript Extension (PhoneGap native code)
    js/ .......... PhoneGap JavaScript (Non-concatenated, non-minified)
    template/ .... Project template for creating a new projects

Introduction
------------

BlackBerry WebWorks is a framework for developing hybrid applications for BlackBerry devices that support Blackberry OS 5.0 and higher.  In this framework, web applications consisting of web content and resources (HTML/CSS/JavaScript) can make use of JavaScript APIs to access device features and capabilities.

The WebWorks framework exposes a subset of device capabilities through the [Blackberry WebWorks API](http://www.blackberry.com/developers/docs/widgetapi/).  In addition, the framework allows applications to use JavaScript Extensions to extend the WebWorks API and access additional device capabilities.  JavaScript Extensions are written in native Java, and expose their own JavaScript API through the WebWorks framework.

The phonegap-blackberry-webworks project allows web developers to develop applications targeting BlackBerry 5.0 and higher devices using the common [PhoneGap API](http://docs.phonegap.com).  Under the covers, PhoneGap makes use of the WebWorks API, where possible.  However, most PhoneGap features are implemented using a WebWorks JavaScript Extension.

Development Options
-------------------

There are two approaches to developing a PhoneGap BlackBerry WebWorks:

1. Using the ANT command-line tool
    - You do not need to install Eclipse
    - You can use your favorite source code editor 
    - Fast and easy to build and deploy applications
2. Eclipse environment
    - Better for developing PhoneGap plugins and WebWorks JavaScript Extensions

Running PhoneGap BlackBerry WebWorks from the Command-line
==========================================================

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

Installing phonegap-blackBerry-webworks Framework
-------------------------------------------------

Cloning the phonegap-blackberry-webworks repository always provides you with the latest (EDGE) version of the PhoneGap code.  To clone the repository, do the following:

    $ cd C:\some\path\
    $ git clone git://github.com/phonegap/phonegap-blackberry-webworks.git

As an alternative, you can download packaged releases of PhoneGap from the [PhoneGap web site](http://phonegap.com).  If choosing this method, simply unzip the PhoneGap packaged code and navigate to the BlackBerry directory.  The steps below remain the same.

Creating a New PhoneGap Project
-------------------------------

The PhoneGap build script enables you to create multiple, independent PhoneGap projects.  The build script packages the PhoneGap source code and resources into each project you create.  This allows you to easily distribute the project to other BlackBerry WebWorks developers.  To create a PhoneGap project:

    $ cd phonegap-blackberry-webworks
    $ ant help
    
    $ ant create -Dproject.path="C:\development\my_new_project"
    
    $ cd C:\development\my_new_project
    $ ant help

For each project, you need to tell ANT where you installed the BlackBerry WebWorks SDK, which packages and compiles your code into a deployable application.  You can specify the location of the BlackBerry WebWorks Packager (BBWP) by editing __project.properties__ in the project directory.

    [edit project.properties]

Building and Deploying a Project
--------------------------------

PhoneGap provides scripts to automate common tasks, such as compiling your project, and deploying it to simulators or devices.  To see what options are available, use:

    $ cd C:\development\my_new_project
    $ ant help
    
To build your project into a deployable application (.cod/.jad) file:

	$ ant build
	
To build your project and load it in a BlackBerry simulator:

    $ ant load-simulator
    
To build your project and load it onto a USB-attached device:

    $ ant load-device

Updating the PhoneGap Framework
-------------------------------

As you develop your application, there may be updates made to the PhoneGap source code.  To incorporate PhoneGap changes into your project, use the build script as follows:

    $ cd phonegap-blackberry-webworks
    $ git pull origin master

    $ ant update -Dproject.path="C:\development\my_new_project"

Debugging a WebWorks Application
--------------------------------

The BlackBerry WebWorks Plugin for Eclipse has some powerful debugging options, such as settings breakpoints in JavaScript. In order to use these features, you must import your source code into a BlackBerry WebWorks project.

### Install Eclipse and the BlackBerry WebWorks Plugin for Eclipse

Follow in the installation instructions under the section __Running PhoneGap BlackBerry WebWorks Applications from Eclipse__.

### Import your BlackBerry WebWorks Project into Eclipse

1. Create a BlackBerry WebWorks/Widget project:
    1. _File_ -> _New_ -> _BlackBerry Widget Project_
        - Project Name: MyNewProject
        - Start Page: index.html
2. Import the PhoneGap resources:
	1. In the project tree, right-click on the project (MyNewProject) and select _Import..._
	2. Select _General_ -> _Filesystem_
	3. Select _Browse..._
	4. Add the _www/_ directory of your project
	    - e.g. C:\development\my_new_project\www
	5. Check the _www/_ directory
	6. Select _Finish_
	7. Select _Yes_ to overwrite the existing index.html and config.xml

Running PhoneGap BlackBerry WebWorks Applications from Eclipse
==============================================================

Overview
--------

It is best to setup two projects in Eclipse: a Java project for the WebWorks JavaScript Extension native Java code, and a Blackberry WebWorks project for the web application code and resources.

Requirements
------------

1. Windows XP and Windows 7 (32-bit and 64-bit)
2. [Sun Java Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/index.html#jdk), version 1.6 (32-bit)
3. [Eclipse 3.5+](http://www.eclipse.org/downloads/), the Classic Eclipse package is fine
4. [BlackBerry Web Plugin for Eclipse](http://na.blackberry.com/eng/developers/browserdev/eclipseplugin.jsp)

Installing the phonegap-blackberry-webworks Framework
-----------------------------------------------------

Cloning the phonegap-blackberry-webworks repository always provides you with the latest (EDGE) version of the PhoneGap code.  To clone the repository, do the following:

    $ cd C:\some\path\
    $ git clone git://github.com/phonegap/phonegap-blackberry-webworks.git

As an alternative, you can download packaged releases of PhoneGap from the [PhoneGap web site](http://phonegap.com).  If choosing this method, simply unzip the PhoneGap packaged code and navigate to the BlackBerry directory.  The steps below remain the same.

Installing the BlackBerry WebWorks Plugin for Eclipse
-----------------------------------------------------

1. Open Eclipse
2. _Help_ -> _Install New Software..._ -> _Click Add..._
	- Name: Blackberry Update - Web
	- Location: http://www.blackberry.com/go/eclipseUpdate/3.5/web
3. Select __Blackberry Web Plugin__ and __Blackberry Widget SDK__
	- Note: Even if the standalone Widget SDK is already installed on your system, you must install the WebWorks plugin to enable Blackberry WebWorks capabilities within Eclipse.
4. Restart Eclipse

Create BlackBerry Java Project for PhoneGap JavaScript Extension
----------------------------------------------------------------

1. Create a BlackBerry Java project
	1. _File_ -> _New_ -> _Project..._ -> _Java Project_
		- Project Name: PhoneGapBlackberryExtension
		    - Do NOT use special characters or whitespace in the project names, as the BlackBerry RAPC compiler will choke on them.
		- _JRE_ -> _Use a project specific JRE: Blackberry JRE 5.0.0_
2. Import the PhoneGap Java source code
	1. Select the PhoneGapBlackberryExtension project
	2. _File_ -> _Import_ -> _phonegap-blackberry-webworks/framework/ext_

Create a New BlackBerry WebWorks Project
----------------------------------------

1. Create a BlackBerry WebWorks/Widget project
    1. _File_ -> _New_ -> _BlackBerry Widget Project_
        - Project Name: PhoneGapBlackberryWidget
        - Start Page: index.html
2. Import the PhoneGap web resources code
	1. In the project tree, right-click on the widget project and select _Import..._
	2. Select _General_ -> _Filesystem_
	3. Import _phonegap-blackberry-webworks/www_
	4. Select _config.xml_ and _index.html_
	5. Select _ext_ and _javascript_ folders
3. Change PhoneGap widget name
	1. Open _config.xml_
	2. Click _Overview_ tab
		- Name: PhoneGap Widget
4. Build the project
    1. Select the project, right-click and select _Build and Sign BlackBerry Widget Project_
5. Run the project
    1. Select the project, right-click and select _Run_ -> _Run as_ -> _Blackberry Simulator_

Troubleshooting
---------------

__Q: I uploaded my application to the BlackBerry device, but it will not open or run.__

__A:__ Try hard resetting the device by pressing and hold ALT + CAPS LOCK + DEL. You must press and hold each key in sequence and not all at once.  Some devices require _either_ the right or left CAPS LOCK key to be pressed.  Some devices also require this combination to be pressed twice.

__Q: My simulator screen is not refreshing and I see blocks on a clicked position.__

__A:__ Windows 7 and the simulator's graphics acceleration do not mix. On the simulator, set View -> Graphics Acceleration to Off.

__Q: When I use the PhoneGap [Camera.getPicture API](http://docs.phonegap.com/phonegap_camera_camera.md.html#camera.getPicture) on my device, the camera never returns to my application.  Why does this happen?__

__A:__ PhoneGap uses a JavaScript Extension to invoke the native camera application so the user can take a picture.  When the picture is taken, PhoneGap will close the native camera application by emulating a key injection (pressing the back/escape button).  On a physical device, users will have to set permissions to allow your application to simulate key injections.  Setting application permissions is device-specific.  On a Storm2 (9550), for example, select the BlackBerry button from the Home screen to get to All Applications screen, then Options > Applications > Your Application.  Then select Edit Default Permissions > Interactions > Input Simulation and set it to 'Allow'.  Save your changes.