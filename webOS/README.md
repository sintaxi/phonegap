PhoneGap BlackBerry WebWorks
============================

[PhoneGap framework](http://www.phonegap.com/) for __BlackBerry OS 5.0 and 6.0__. The framework is implemented using the [BlackBerry WebWorks SDK](http://us.blackberry.com/developers/browserdev/widgetsdk.jsp).

Directory Structure
-------------------

    framework/ ... BlackBerry WebWorks JavaScript Extension (PhoneGap native code)
    javascript/ .. PhoneGap JavaScript (Non-concatenated, non-minified)
    lib/ ......... Third party tools (YUICompressor for JS minification)
    template/ .... Project template for creating a new projects

Introduction
------------

BlackBerry WebWorks is a framework for developing hybrid applications for BlackBerry devices that support __Blackberry OS 5.0 and higher__.  BlackBerry WebWorks is not supported on BlackBerry OS 4.x.  

The WebWorks framework allows developers to create applications using web content and resources (HTML/CSS/JavaScript) that are able to access device features through the [Blackberry WebWorks API](http://www.blackberry.com/developers/docs/widgetapi/).  In addition, the framework allows developers to create their own WebWorks JavaScript Extensions to expose additional device capabilities through JavaScript APIs.  These extensions are written using the native BlackBerry Java API.

The phonegap-blackberry-webworks platform allows web developers to develop applications targeting BlackBerry 5.0 and higher devices using the common [PhoneGap API](http://docs.phonegap.com).  When possible, PhoneGap makes use of the WebWorks JavaScript API; however, most PhoneGap features are implemented in the native Java environment as a WebWorks JavaScript Extension.


Getting Started
===============

Several guides are available on the [PhoneGap Wiki](http://wiki.phonegap.com) to help you get started developing for the phonegap-blackberry-webworks platform.  This guide will help you install and configure the BlackBerry WebWorks development environment, and the phonegap-blackberry-webworks platform.  It will also step you through the process of creating a PhoneGap project.  

[Getting Started with PhoneGap BlackBerry WebWorks](http://wiki.phonegap.com/w/page/31930982/Getting-Started-with-PhoneGap-BlackBerry-WebWorks)

This guide is for advanced developers who wish to develop their own phonegap-blackberry-webworks plugin.

[How To Create a PhoneGap Plugin for PhoneGap BlackBerry WebWorks](http://wiki.phonegap.com/w/page/35799737/How-To-Create-a-PhoneGap-Plugin-for-BlackBerry-WebWorks)


Installing the phonegap-blackberry-webworks Framework
=====================================================

Cloning the phonegap-blackberry-webworks repository always provides you with the latest (EDGE) version of the PhoneGap code.  To clone the repository, do the following:

    $ cd C:\some\path\
    $ git clone git://github.com/phonegap/phonegap-blackberry-webworks.git

As an alternative, you can download packaged releases of PhoneGap from the [PhoneGap web site](http://phonegap.com).  If choosing this method, simply unzip the PhoneGap packaged code and navigate to the BlackBerry/WebWorks directory.  The steps below remain the same.


Creating a New PhoneGap Project
-------------------------------

The PhoneGap build script enables you to create multiple, independent PhoneGap projects.  

(Note: The PhoneGap build script requries Apache ANT 1.8 or higher.  See the [Getting Started guide](http://wiki.phonegap.com/w/page/31930982/Getting-Started-with-PhoneGap-BlackBerry-WebWorks) for instructions on how to install and configure Apache ANT).  

The build script packages the PhoneGap source code and resources into each project you create.  This allows you to easily distribute the project to other BlackBerry WebWorks developers.  To create a PhoneGap project:

    $ cd phonegap-blackberry-webworks
    $ ant help
    
    $ ant create -Dproject.path="C:\development\my_new_project"
    
    $ cd C:\development\my_new_project
    $ ant help

For each project, you need to tell ANT where you installed the BlackBerry WebWorks SDK, which packages and compiles your code into a deployable application.  You can specify the location of the BlackBerry WebWorks Packager (BBWP) by editing __project.properties__ in the project directory.

    [edit project.properties]

Building and Deploying a Project
--------------------------------

The PhoneGap build scripts automate common tasks, such as compiling your project, and deploying it to simulators or devices.  To see what options are available, use:

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


Troubleshooting
===============

__Q: I uploaded my application to the BlackBerry device, but it will not open or run.__

__A:__ Try hard resetting the device by pressing and hold ALT + CAPS LOCK + DEL. You must press and hold each key in sequence and not all at once.  Some devices require _either_ the right or left CAPS LOCK key to be pressed.  Some devices also require this combination to be pressed twice.

__Q: My simulator screen is not refreshing and I see blocks on a clicked position.__

__A:__ Windows 7 and the simulator's graphics acceleration do not mix. On the simulator, set View -> Graphics Acceleration to Off.

__Q: When I use the PhoneGap [Camera.getPicture API](http://docs.phonegap.com/phonegap_camera_camera.md.html#camera.getPicture) on my device, the camera never returns to my application.  Why does this happen?__

__A:__ PhoneGap uses a JavaScript Extension to invoke the native camera application so the user can take a picture.  When the picture is taken, PhoneGap will close the native camera application by emulating a key injection (pressing the back/escape button).  On a physical device, users will have to set permissions to allow the application to simulate key injections.  Setting application permissions is device-specific.  On a Storm2 (9550), for example, select the BlackBerry button from the Home screen to get to All Applications screen, then Options > Applications > Your Application.  Then select Edit Default Permissions > Interactions > Input Simulation and set it to 'Allow'.  Save your changes.
