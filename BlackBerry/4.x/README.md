PhoneGap BlackBerry
===================

[PhoneGap framework](http://www.phonegap.com/) for BlackBerry OS 4.6.x. The framework is implemented using the [BlackBerry Java SDK](http://na.blackberry.com/eng/developers/javaappdev/).

Directory Structure
-------------------

    app/ .......... Template used to generate new projects
    framework/ .... PhoneGap Java implementation
    js/ ........... PhoneGap JavaScript bindings
    util/ ......... Libraries used by ANT build script

Introduction
------------

PhoneGap BlackBerry allows developers to create BlackBerry OS 4.6.x applications using HTML, CSS and JavaScript. JavaScript functions can then bridge into device functionality (implemented in Java) such as geolocation, SMS, device information, and accelerometer. PhoneGap defines a [common API](http://docs.phonegap.com/) that exists on all PhoneGap implementations, but you can also create your own plugins.

Resources
---------

- [API Documentation](http://docs.phonegap.com/)
- [PhoneGap Wiki](http://wiki.phonegap.com/)
- [PhoneGap Discussion Group](http://groups.google.com/group/phonegap)
- PhoneGap IRC Channel
    - Server: irc.freenode.net
    - Channel: #phonegap

Development Options
-------------------

Regardless of your development preference, you must install both ANT and Eclipse.

1. ANT command-line tool
    - You can use your favourite source code editor
    - Fast and easy to build and deploy applications
2. Eclipse environment
    - Better for developing PhoneGap plugins extensions
    - You still need to use ANT

Getting Started
===============

Requirements
------------

1. Windows XP and Windows 7 (32-bit and 64-bit)
2. [Sun Java Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/index.html#jdk), version 1.6 (32-bit)
3. [ANT](http://ant.apache.org/bindownload.cgi)
4. [Eclipse 3.5+](http://www.eclipse.org/downloads/), the Classic Eclipse package is fine
5. [BlackBerry Java Plugin for Eclipse](http://na.blackberry.com/eng/developers/javaappdev/javaplugin.jsp)

Installing Java / Eclipse / BlackBerry Java Plugin
--------------------------------------------------

- Please follow the [Getting Started with BlackBerry guide on the wiki](http://phonegap.pbworks.com/Getting+Started+with+PhoneGap-BlackBerry+with+the+Latest+Environment).

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

Installing PhoneGap-BlackBerry Framework
----------------------------------------

    $ cd C:\some\path\
    $ git clone git://github.com/phonegap/phonegap-blackberry.git
    $ cd phonegap-blackberry
    $ ant help

Creating a New Project
----------------------

Each project contains the PhoneGap framework and so the project is independent of the phonegap-blackberry source code. This allows you to easily distribute the project to other BlackBerry developers.

    $ cd phonegap-blackberry
    $ ant

    $ ant create -Dapp.name="MyApp" -Doutput.dir="C:\development\my_app\" -Dpackage="com.phonegap"

    $ cd C:\development\my_app
    $ ant help

Configure a Project
-------------------

    $ cd C:\development\my_mapp
    $ [edit] common.properties
    $ [edit] project.properties

### common.properties

- Edit the `jde.home` to point to your Eclipse JDE Component Pack. You __must__ double escape each backslash.

### project.properties

- Not required.
- Lots of goodies in here, such as choose the application title and icon name.

Build and Deploy a Project
--------------------------

    $ cd C:\development\my_app
    $ ant help

    $ ant load-simulator

    $ ant load-device

Update the PhoneGap Framework
-----------------------------

    $ cd C:\development\phonegap-blackberry
    $ git pull origin master

    $ ant update -Dproject.path="C:\development\my_app"

Import a Project into Eclipse
=============================

Some people prefer the Eclipse development or need it to debug PhoneGap plugins written in Java.

1. Open Eclipse
2. File -> New -> Project...
    - Select "BlackBerry project"
3. Select "Create project from existing source"
    - Choose the project directory
    - It was specified as the `output.dir` in the ANT script
    - e.g. `C:\development\my_app`
4. Select Finish
5. Link www/ in the src/ directory
    1. Right-click on src/
    2. Select New -> Other -> Folder
    3. Select "Advanced"
    4. Select "Link to folder on the file system"
    5. Browse to your project's www/ directory (`C:\development\my_app\www`)
6. Run / Debug the project
    1. Right-click on the project
    2. Select "Run as..." -> "Simulator"
    3. Select "Debug as..." -> "Simulator" / "Device"
    4. __NOTE:__ Whatever simulator or device you are using must have the `PhoneGapBlackBerryLib.cod`
        - Automated approach: Run `ant load-simulator` or `ant load-device` once.
        - Desktop approach: Use the BlackBerry Desktop Manager to install `C:\development\my_app\lib\PhoneGapBlackBerryLib.cod`
        - CLI approach: Use `JavaLoader.exe` that is bundled with the BlackBerry SDK.
            - `JavaLoader.exe -u load C:\development\my_app\lib\PhoneGapBlackBerryLib.cod`
7. [Code Signing](http://na.blackberry.com/eng/developers/javaappdev/codekeys.jsp)
    - BlackBerry menu -> Request Signatures
    - You do not need to code sign applications on the simulator
    - You must code sign applications that are deployed to the device.
8. Distribution
    - BlackBerry Desktop Manager
        - Right-click on the project name
        - Select "Generate ALX file"
        - Open ALX file in the Desktop Manager
    - ANT
        - `ant load-device`
    - JavaLoader
        - `JavaLoader.exe -u load C:\path\to\app.cod`
    - Over-the-air installation
        - Set up your application .jad, .jar and .cod files onto a web server.
        - See the [official documentation](http://assets.handango.com/marketing/developerTeam/BlackBerryOTADeployment.pdf) for details