Apache Cordova for Windows Phone 8
===

Apache Cordova WP8 is a .net application library that lets you create Apache Cordova applications targeting Windows Phone 8 devices.
Apache Cordova based applications are, at the core, an application written with web technology: HTML, CSS and JavaScript.

Requires
---

- Windows Phone SDK 8 [http://www.microsoft.com/en-us/download/details.aspx?id=35471]


Getting Started
---

- copy the file templates/CordovaStarter-x.x.x.zip to the folder : \My Documents\Visual Studio 2012\Templates\ProjectTemplates\
 - if you have just installed VisualStudio, you should launch it once to create this folder
 - if you prefer, you may add the project instead to the "Silverlight for Windows Phone" subfolder of "Visual C#".  This is up to you, and only affects where the project template is shown when creating a new project. Also, You may need to create this folder.
- Launch Visual Studio 2012 and select to create a new project
 - CordovaStarter should be listed as an option, give your new project a name
  - Note: The description will let you know the version of Cordova you are targetting, if you have multiple templates.
 - If you do not see it, you may have to select the top level 'Visual C#' to see it
- Build and Run it!


Known Problem Areas
---

Many of the Media APIs will not function as expected when debugging while connect to the device with the Zune software.
To get around this, you need to use the Windows Phone Connect tool. For details, please check out this [MSDN blog article](http://blogs.msdn.com/b/jaimer/archive/2010/11/03/tips-for-debugging-wp7-media-apps-with-wpconnect.aspx).


BUGS?
-----
File them at Apache Incubator
https://issues.apache.org/jira/browse/CB

Further Reading
---

- [http://docs.phonegap.com](http://docs.phonegap.com)
- [http://wiki.phonegap.com](http://wiki.phonegap.com)
