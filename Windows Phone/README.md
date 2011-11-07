PhoneGap/WP7 Mango
===

PhoneGap WP7 is a .net application library that lets you create PhoneGap applications targeting WP7 Mango devices.
PhoneGap based applications are, at the core, an application written with web technology: HTML, CSS and JavaScript.

Requires
---

- Windows Phone SDK 7.1 [http://create.msdn.com/en-us/home/getting_started]


Getting Started (Hey, not too rough)
---

- copy the file GapAppStarter.zip to the folder : \My Documents\Visual Studio 2010\Templates\ProjectTemplates\
- Launch Visual Studio 2010 and select to create a new project
-- GapAppStarter should be listed as an option, give it a name
-- If you do not see it, you may have to select the top level 'Visual C#' to see it
- Build and Run it!

Note!!!
---

When you add or remove files/folders in the www folder you will need to do the following

- ensure the new item is included in the project ( Content )
-- Do not modify the GapSourceDictionary.xml file which is included in the project, it is auto-generated for you when you build.


Getting Started ( Ultra-Violence ! aka for contributors )
---

- make sure you have the 7.1 SDK installed
- fork/git or download/unzip the repo to your harddrive
- copy the file GapAppStarter.zip to the folder : \My Documents\Visual Studio 2010\Templates\ProjectTemplates\
- Launch Visual Studio 2010 and select to create a new project
-- GapAppStarter should be listed as an option, give it a name
- Right-Click on the solution and select Add->Existing Project, and add the project :
 framework\WP7GapClassLib.csproj from the downloaded repo
- Right-Click your main project and "Add Reference" to the WP7GapClassLib project
- build and run!

  



BUGS?
-----
File them at [PhoneGap-WP7 GitHub Issues](https://github.com/phonegap/phonegap-wp7/issues)      
<br />


Further Reading
---

- [http://docs.phonegap.com](http://docs.phonegap.com)
- [http://wiki.phonegap.com](http://wiki.phonegap.com)