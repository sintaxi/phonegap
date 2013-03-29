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

/*
 * create a cordova/wp8 project
 *
 * USAGE
 *  ./create [path package activity]

    ./bin/create.bat ~/MyTestProj "test.proj" "TestProject"
 */


var fso=WScript.CreateObject("Scripting.FileSystemObject"),
    wscript_shell = WScript.CreateObject("WScript.Shell");
// working dir
var ROOT = WScript.ScriptFullName.split('\\bin\\create.js').join('');

var args = WScript.Arguments,
    FRAMEWORK_PATH = '\\framework',
    TEMPLATES_PATH = '\\templates',
    // sub folder for standalone project
    STANDALONE_PATH = TEMPLATES_PATH + '\\standalone',
    // sub folder for full project
    FULL_PATH = TEMPLATES_PATH + '\\full',
    CUSTOM_PATH = TEMPLATES_PATH + '\\custom',
    // default template to use when creating the project
    CREATE_TEMPLATE = FULL_PATH,
    PROJECT_PATH, 
    PACKAGE, 
    NAME,
    // get version number
    VERSION=read(ROOT+'\\VERSION').replace(/\r\n/,'').replace(/\n/,''),
    BASE_VERSION = VERSION.split('rc', 1) + ".0";

function Usage()
{

    WScript.StdOut.WriteLine("Usage: create PathTONewProject [ PackageName AppName ]");
    WScript.StdOut.WriteLine("    PathTONewProject : The path to where you wish to create the project");
    WScript.StdOut.WriteLine("    PackageName      : The namespace for the project (default is CordovaAppProj)")
    WScript.StdOut.WriteLine("    AppName          : The name of the application (default is CordovaAppProj)");
    WScript.StdOut.WriteLine("examples:");
    WScript.StdOut.WriteLine("    create C:\\Users\\anonymous\\Desktop\\MyProject");
    WScript.StdOut.WriteLine("    create C:\\Users\\anonymous\\Desktop\\MyProject io.Cordova.Example AnApp");
}


var ForReading = 1, ForWriting = 2, ForAppending = 8;
var TristateUseDefault = -2, TristateTrue = -1, TristateFalse = 0;

function read(filename) {
    //WScript.Echo('Reading in ' + filename);
    
    var f=fso.OpenTextFile(filename, 1,2);
    var s=f.ReadAll();
    f.Close();
    return s;
}

function write(filename, contents) {
    //var fso=WScript.CreateObject("Scripting.FileSystemObject");
    var f=fso.OpenTextFile(filename, ForWriting, TristateTrue);
    f.Write(contents);
    f.Close();
}
function replaceInFile(filename, regexp, replacement) {
    write(filename,read(filename).replace(regexp,replacement));
}


// executes a commmand in the shell
function exec(command) {
    var oShell=wscript_shell.Exec(command);
    while (oShell.Status == 0) {
        WScript.sleep(100);
    }
}

// executes a commmand in the shell
function exec_verbose(command) {
    //WScript.StdOut.WriteLine("Command: " + command);
    var oShell=wscript_shell.Exec(command);
    while (oShell.Status == 0) {
        //Wait a little bit so we're not super looping
        WScript.sleep(100);
        //Print any stdout output from the script
        if(!oShell.StdOut.AtEndOfStream) {
            var line = oShell.StdOut.ReadLine();
            WScript.StdOut.WriteLine(line);
        }
    }
    //Check to make sure our scripts did not encounter an error
    if(!oShell.StdErr.AtEndOfStream)
    {
        var line = oShell.StdErr.ReadAll();
        WScript.StdErr.WriteLine(line);
        WScript.Quit(1);
    }
}
function genGuid()
{
    var TypeLib = WScript.CreateObject("Scriptlet.TypeLib");
    strGuid = TypeLib.Guid.split("}")[0]; // there is extra crap after the } that is causing file streams to break, probably an EOF ... 
    strGuid = strGuid.replace(/[\{\}]/g,""); 
    return strGuid;
}
// builds the new cordova dll from the framework
function build_dll()
{
    WScript.StdOut.WriteLine("Building dll...");
    if(fso.FolderExists(ROOT + FRAMEWORK_PATH + '\\Bin'))
    {
        fso.DeleteFolder(ROOT + FRAMEWORK_PATH + '\\Bin');
    }
    if(fso.FolderExists(ROOT + FRAMEWORK_PATH + '\\obj'))
    {
        fso.DeleteFolder(ROOT + FRAMEWORK_PATH + '\\obj');
    }
    // move to framework directory
    wscript_shell.CurrentDirectory = ROOT + FRAMEWORK_PATH;
    // build .dll in Release
    exec_verbose('msbuild /p:Configuration=Release;VersionNumber=' + VERSION + ';BaseVersionNumber=' + BASE_VERSION);
    //Check if file dll was created
    if(!fso.FileExists(ROOT + FRAMEWORK_PATH + '\\Bin\\Release\\WPCordovaClassLib.dll'))
    {
        WScript.StdErr.WriteLine('ERROR: MSBuild failed to create .dll when building WPCordovaClassLib.dll');
        WScript.Quit(1);
    }
    WScript.StdOut.WriteLine("SUCCESS BUILDING DLL");
}

function create(path, namespace, name)
{
    WScript.StdOut.WriteLine("Creating Cordova-WP7 Project:");
    WScript.StdOut.WriteLine("\tApp Name : " + name);
    WScript.StdOut.WriteLine("\tNamespace : " + namespace);
    WScript.StdOut.WriteLine("\tPath : " + path);

    // Copy the template source files to the new destination

    //var fso=WScript.CreateObject("Scripting.FileSystemObject");
    //WScript.Echo("src = " + ROOT + "\\templates\\standalone");
    fso.CopyFolder(ROOT + CREATE_TEMPLATE, path);

    var newProjGuid = genGuid();
    // replace the guid in the AppManifest
    replaceInFile(path + "\\Properties\\WMAppManifest.xml","$guid1$",newProjGuid);
    // replace safe-project-name in AppManifest
    replaceInFile(path + "\\Properties\\WMAppManifest.xml",/\$safeprojectname\$/g,name);
    replaceInFile(path + "\\Properties\\WMAppManifest.xml",/\$projectname\$/g,name);


    replaceInFile(path + "\\App.xaml",/\$safeprojectname\$/g,namespace);
    replaceInFile(path + "\\App.xaml.cs",/\$safeprojectname\$/g,namespace);

    replaceInFile(path + "\\MainPage.xaml",/\$safeprojectname\$/g,namespace);
    replaceInFile(path + "\\MainPage.xaml.cs",/\$safeprojectname\$/g,namespace);
    replaceInFile(path + "\\CordovaAppProj.csproj",/\$safeprojectname\$/g,namespace);

    //set up debug + emulate paths
    replaceInFile(path + "\\cordova\\debug.bat",/__PATH_TO_TOOLING_SCRIPTS__/g, ROOT + '\\tooling\\scripts');
    replaceInFile(path + "\\cordova\\emulate.bat",/__PATH_TO_TOOLING_SCRIPTS__/g, ROOT + '\\tooling\\scripts');
    replaceInFile(path + "\\cordova\\debug.bat",/__PATH_TO_PROJ__/g, path);
    replaceInFile(path + "\\cordova\\emulate.bat",/__PATH_TO_PROJ__/g, path);

    //copy .dll if necessary
    if(CREATE_TEMPLATE == FULL_PATH)
    {
        var dllPath = ROOT + FRAMEWORK_PATH + '\\Bin\\Release\\WPCordovaClassLib.dll';
        if(fso.FileExists(dllPath))
        {
            WScript.Echo(".dll File Exists");
        }
        else
        {
            WScript.Echo("Warning: Missing Library! Could not find the file: " + dllPath);
            build_dll();
        }

        if(!fso.FolderExists(path + '\\CordovaLib'))
        {
            fso.CreateFolder(path + '\\CordovaLib');
        }
        exec('%comspec% /c xcopy ' + ROOT + FRAMEWORK_PATH + '\\Bin\\Release\\WPCordovaClassLib.dll ' + path + '\\CordovaLib');
        if(!fso.FileExists(path + '\\CordovaLib\\WPCordovaClassLib.dll'))
        {
            WScript.StdErr.WriteLine('ERROR: Failed to copy WPCordovaClassLib.dll to project from');
            WScript.StdErr.WriteLine('\t' + ROOT + FRAMEWORK_PATH + '\\Bin\\Release\\WPCordovaClassLib.dll');
            WScript.StdErr.WriteLine('\tto');
            WScript.StdErr.WriteLine('\t' + path + '\\CordovaLib')
            WScript.Quit(1);
        }
    }

     WScript.StdOut.WriteLine("CREATE SUCCESS : " + path);

    // TODO: Name the project according to the arguments
    // update the solution to include the new project by name
    // version BS
    // index.html title set to project name ?

}
    

if(args.Count() > 0)
{
    // support help flags
    if(args(0) == "--help" || args(0) == "/?" ||
            args(0) == "help" || args(0) == "-help" || args(0) == "/help" || args(0) == "-h")
    {
        Usage();
        WScript.Quit(1);
    }

    PROJECT_PATH = args(0);
    if(fso.FolderExists(PROJECT_PATH))
    {
        WScript.StdOut.WriteLine("Project directory already exists:");
        WScript.StdOut.WriteLine("\t" + PROJECT_PATH);
        WScript.StdOut.WriteLine("CREATE FAILED.");
        WScript.Quit(1);
    }

    if(args.Count() > 1)
    {
        PACKAGE = args(1);
    }
    else
    {
        PACKAGE = "Cordova.Example";
    }

    if(args.Count() > 2)
    {
        NAME = args(2);
    }
    else
    {
        NAME = "CordovaAppProj";
    }

    create(PROJECT_PATH, PACKAGE, NAME);
}
else
{
    Usage();
    WScript.Quit(1);
}

