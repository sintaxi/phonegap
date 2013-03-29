/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
*/

var fso = WScript.CreateObject('Scripting.FileSystemObject'),
    shell = WScript.CreateObject("shell.application"),
    wscript_shell = WScript.CreateObject("WScript.Shell");

var args = WScript.Arguments,
    // root folder of cordova-wp7 (i.e C:\Cordova\cordova-wp7)
    ROOT = WScript.ScriptFullName.split('\\tooling\\', 1),
    // sub folder containing templates
    TEMPLATES_PATH = '\\templates',
    // sub folder for standalone project
    STANDALONE_PATH = TEMPLATES_PATH + '\\standalone',
    // sub folder for full project
    FULL_PATH = TEMPLATES_PATH + '\\full',
    // sub folder containing framework
    FRAMEWORK_PATH = '\\framework',
    // subfolder containing example project
    EXAMPLE_PATH = '\\example',
    // get version number
    VERSION=read(ROOT+'\\VERSION').replace(/\r\n/,'').replace(/\n/,''),
    BASE_VERSION = VERSION.split('rc', 1) + ".0";

// destination directory to package
var BUILD_DESTINATION;
// add templates to visual studio?
var ADD_TO_VS = false;

// help function
function Usage()
{
    WScript.StdOut.WriteLine("");
    WScript.StdOut.WriteLine("Usage: package [ PathToCordovaWP7 ]");
    WScript.StdOut.WriteLine("    PathToCordovaWP7 : Cordova-wp7 repo you wish to package for release");
    WScript.StdOut.WriteLine("examples:");
    WScript.StdOut.WriteLine("    package C:\\Users\\anonymous\\Desktop\\cordova-wp7");
    WScript.StdOut.WriteLine("    package     // packages current cordova directory");
    WScript.StdOut.WriteLine("");
}

// returns the contents of a file
function read(filename) {
    //WScript.StdOut.WriteLine('Reading in ' + filename);
    if(fso.FileExists(filename))
    {
        var f=fso.OpenTextFile(filename, 1,2);
        var s=f.ReadAll();
        f.Close();
        return s;
    }
    else
    {
        WScript.StdOut.WriteLine('ERROR: Cannot read non-existant file : ' + filename);
        WScript.Quit(1);
    }
    return null;
}

// executes a commmand in the shell
function exec(command) {
    var oShell=wscript_shell.Exec(command);
    while (oShell.Status == 0) {
        WScript.sleep(100);
    }
}

// packages templates into .zip
function package_templates()
{
    WScript.StdOut.WriteLine("Creating template .zip files ...");

    var standalone_zip = BUILD_DESTINATION + '\\CordovaWP7_' + VERSION.replace(/\./g, '_') + '_StandAlone.zip';
    var full_zip = BUILD_DESTINATION + '\\CordovaWP7_' + VERSION.replace(/\./g, '_') + '_Full.zip';
    if(fso.FileExists(standalone_zip))
    {
      fso.DeleteFile(standalone_zip);
    }
    if(fso.FileExists(full_zip))
    {
      fso.DeleteFile(full_zip);
    }

    exec('%comspec% /c copy ' + BUILD_DESTINATION + TEMPLATES_PATH + '\\vs\\MyTemplateFull.vstemplate ' + BUILD_DESTINATION + FULL_PATH + '\\MyTemplate.vstemplate');
    exec('%comspec% /c copy ' + BUILD_DESTINATION + TEMPLATES_PATH + '\\vs\\pg_templateIcon.png ' + BUILD_DESTINATION + FULL_PATH + '\\__TemplateIcon.png');
    exec('%comspec% /c copy ' + BUILD_DESTINATION + TEMPLATES_PATH + '\\vs\\pg_templatePreview.jpg ' + BUILD_DESTINATION + FULL_PATH + '\\__PreviewImage.jpg');
    exec('%comspec% /c copy ' + BUILD_DESTINATION + '\\VERSION ' + BUILD_DESTINATION + FULL_PATH);
    if(fso.FileExists(BUILD_DESTINATION + FRAMEWORK_PATH + '\\Bin\\Release\\WPCordovaClassLib.dll'))
    {
        exec('%comspec% /c copy Bin\\Release\\WPCordovaClassLib.dll ' + BUILD_DESTINATION + FULL_PATH + '\\CordovaLib');
    }
    else
    {
        WScript.StdOut.WriteLine("ERROR: WPCordovaClassLib.dll No found! Unable to fully package cordova.");
        WScript.StdOut.WriteLine("PACKAGE FAILED.");
        WScript.Quit(1);
    }

    exec('%comspec% /c copy ' + BUILD_DESTINATION + TEMPLATES_PATH + '\\vs\\MyTemplateStandAlone.vstemplate ' + BUILD_DESTINATION + STANDALONE_PATH + '\\MyTemplate.vstemplate');
    exec('%comspec% /c copy ' + BUILD_DESTINATION + TEMPLATES_PATH + '\\vs\\pg_templateIcon.png ' + BUILD_DESTINATION + STANDALONE_PATH + '\\__TemplateIcon.png');
    exec('%comspec% /c copy ' + BUILD_DESTINATION + TEMPLATES_PATH + '\\vs\\pg_templatePreview.jpg ' + BUILD_DESTINATION + STANDALONE_PATH + '\\__PreviewImage.jpg');
    exec('%comspec% /c copy ' + BUILD_DESTINATION + '\\VERSION ' + BUILD_DESTINATION + STANDALONE_PATH);

    exec('cscript ' + BUILD_DESTINATION + '\\tooling\\scripts\\win-zip.js ' + full_zip + ' ' + BUILD_DESTINATION + FULL_PATH + '\\');
    exec('cscript ' + BUILD_DESTINATION + '\\tooling\\scripts\\win-zip.js ' + standalone_zip + ' ' + BUILD_DESTINATION + STANDALONE_PATH + '\\');


    if(ADD_TO_VS)
    {
        var template_dir = wscript_shell.ExpandEnvironmentStrings("%USERPROFILE%") + '\\Documents\\Visual Studio 2012\\Templates\\ProjectTemplates';
        if(fso.FolderExists(template_dir ))
        {
            dest = shell.NameSpace(template_dir);
            dest.CopyHere(standalone_zip, 4|20);
            dest.CopyHere(full_zip, 4|20);
        }
        else
        {
            WScript.StdOut.WriteLine("WARNING: Could not find template directory in Visual Studio,\n you can manually copy over the template .zip files.")
        }
	}
}

// builds the new cordova dll and copys it to the full template (only done because of the version referance in Device.cs)
function build_dll()
{
    WScript.StdOut.WriteLine("Packaging .dll ...");
    // move to framework directory
    wscript_shell.CurrentDirectory = BUILD_DESTINATION + FRAMEWORK_PATH;
    // build .dll in Release
    exec_verbose('msbuild /p:Configuration=Release;VersionNumber=' + VERSION + ';BaseVersionNumber=' + BASE_VERSION);
    //Check if file dll was created
    if(!fso.FileExists(BUILD_DESTINATION + FRAMEWORK_PATH + '\\Bin\\Release\\WPCordovaClassLib.dll'))
    {
        WScript.StdErr.WriteLine('ERROR: MSBuild failed to create .dll when reversioning cordova-wp7.');
        WScript.Quit(1);
    }

    if(!fso.FolderExists(BUILD_DESTINATION + FULL_PATH + '\\CordovaLib'))
    {
        fso.CreateFolder(BUILD_DESTINATION + FULL_PATH + '\\CordovaLib');
    }
    exec('%comspec% /c copy Bin\\Release\\WPCordovaClassLib.dll ' + BUILD_DESTINATION + FULL_PATH + '\\CordovaLib');

    WScript.StdOut.WriteLine("SUCESS");
}

// delete any unnessisary files when finished
function cleanUp() {

  if(fso.FileExists(BUILD_DESTINATION + FULL_PATH + '\\MyTemplate.vstemplate')) {
      fso.DeleteFile(BUILD_DESTINATION + FULL_PATH + '\\MyTemplate.vstemplate');
  }
  if(fso.FileExists(BUILD_DESTINATION + STANDALONE_PATH + '\\MyTemplate.vstemplate')) {
      fso.DeleteFile(BUILD_DESTINATION + STANDALONE_PATH + '\\MyTemplate.vstemplate');
  }
  if(fso.FileExists(BUILD_DESTINATION + FULL_PATH + '\\__PreviewImage.jpg')) {
      fso.DeleteFile(BUILD_DESTINATION + FULL_PATH + '\\__PreviewImage.jpg');
  }
  if(fso.FileExists(BUILD_DESTINATION + FULL_PATH + '\\__TemplateIcon.png')) {
      fso.DeleteFile(BUILD_DESTINATION + FULL_PATH + '\\__TemplateIcon.png');
  }
  if(fso.FileExists(BUILD_DESTINATION + STANDALONE_PATH + '\\__PreviewImage.jpg')) {
      fso.DeleteFile(BUILD_DESTINATION + STANDALONE_PATH + '\\__PreviewImage.jpg');
  }
  if(fso.FileExists(BUILD_DESTINATION + STANDALONE_PATH + '\\__TemplateIcon.png')) {
      fso.DeleteFile(BUILD_DESTINATION + STANDALONE_PATH + '\\__TemplateIcon.png');
  }
  //Add any other cleanup here
}


WScript.StdOut.WriteLine("");

if(args.Count() > 0)
{
    //Support help flags
    if(args(0).indexOf("--help") > -1 ||
         args(0).indexOf("/?") > -1 )
    {
        Usage();
        WScript.Quit(1);
    }

    if(fso.FolderExists(args(0)) && fso.FolderExists(args(0) + '\\tooling'))
    {
        BUILD_DESTINATION = args(0);
    }
    else
    {
        WScript.StdOut.WriteLine("ERROR: The given directory is not a cordova-wp7 repo.");
        Usage();
        WScript.Quit(1);

    }
}
else
{
    BUILD_DESTINATION = ROOT;
}

// build dll for full template
//build_dll();
// build/package the templates
package_templates(BUILD_DESTINATION);

cleanUp();

WScript.StdOut.WriteLine("SUCESS");