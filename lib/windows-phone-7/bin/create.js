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
    TEMPLATES_PATH = '\\templates',
    // sub folder for standalone project
    STANDALONE_PATH = TEMPLATES_PATH + '\\standalone',
    // sub folder for full project
    FULL_PATH = TEMPLATES_PATH + '\\full',
    // default template to use when creating the project
    CREATE_TEMPLATE = STANDALONE_PATH,
    PROJECT_PATH,
    PACKAGE,
    NAME;

// working dir
var ROOT = WScript.ScriptFullName.split('\\bin\\create.js').join('');

function Usage()
{

    WScript.StdOut.WriteLine("Usage: create PathTONewProject [ PackageName AppName ]");
    WScript.StdOut.WriteLine("    PathTONewProject : The path to where you wish to create the project");
    WScript.StdOut.WriteLine("    PackageName      : The namespace for the project (default is Cordova.Example)")
    WScript.StdOut.WriteLine("    AppName          : The name of the application (default is CordovaAppProj)");
    WScript.StdOut.WriteLine("examples:");
    WScript.StdOut.WriteLine("    create C:\\Users\\anonymous\\Desktop\\MyProject");
    WScript.StdOut.WriteLine("    create C:\\Users\\anonymous\\Desktop\\MyProject io.Cordova.Example AnApp");
}

var ForReading = 1, ForWriting = 2, ForAppending = 8;
var TristateUseDefault = -2, TristateTrue = -1, TristateFalse = 0;

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
        WScript.StdOut.WriteLine('Cannot read non-existant file : ' + filename);
        WScript.Quit(1);
    }
    return null;
}

function write(filename, contents) {
    var fso=WScript.CreateObject("Scripting.FileSystemObject");
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
        if(!oShell.StdOut.AtEndOfStream) {
            var line = oShell.StdOut.ReadLine();
            // XXX: Change to verbose mode
            // WScript.StdOut.WriteLine(line);
        }
        WScript.sleep(100);
    }
}

// generate unique project GUID - Not needed unless building an actual project (example?)
function genGuid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
              return v.toString(16);
            });
}

// creates a project from the standalone template
function create(path, namespace, name)
{
    WScript.StdOut.WriteLine("Creating Cordova-WP7 Project:");
    WScript.StdOut.WriteLine("\tApp Name : " + name);
    WScript.StdOut.WriteLine("\tNamespace : " + namespace);
    WScript.StdOut.WriteLine("\tPath : " + path);

    fso.CreateFolder(path);

    // copy everything from standalone to project directory
    var dest = shell.NameSpace(path);
    var sourceItems = shell.NameSpace(ROOT + CREATE_TEMPLATE).items();
    if (dest != null)
    {
        dest.CopyHere(sourceItems, 4|20);
        WScript.Sleep(1000);
    }
    else
    {
        WScript.StdOut.WriteLine("Failed to create project directory.");
        WScript.StdOut.WriteLine("CREATE FAILED.");
        WScript.Quit(1);
    }

    // delete any generated files that might have been in template
    if(fso.FolderExists(path + "\\obj"))
    {
        fso.DeleteFolder(path + "\\obj");
    }
    if(fso.FolderExists(path + "\\Bin"))
    {
        fso.DeleteFolder(path + "\\Bin");
    }

    // replace the guid in the AppManifest
    var newProjGuid = genGuid();
    replaceInFile(path + "\\Properties\\WMAppManifest.xml", /\$guid1\$/, newProjGuid);
    // replace safe-project-name in all files
    replaceInFile(path + "\\Properties\\WMAppManifest.xml",/\$safeprojectname\$/g, name);

    replaceInFile(path + "\\App.xaml",/\$safeprojectname\$/g, namespace);
    replaceInFile(path + "\\App.xaml.cs",/\$safeprojectname\$/g, namespace);
    replaceInFile(path + "\\CordovaAppProj.csproj",/\$safeprojectname\$/g, namespace);
    replaceInFile(path + "\\MainPage.xaml",/\$safeprojectname\$/g, namespace);
    replaceInFile(path + "\\MainPage.xaml.cs",/\$safeprojectname\$/g, namespace);

    //set up debug + emulate paths
    replaceInFile(path + "\\cordova\\debug.bat",/__PATH_TO_TOOLING_SCRIPTS__/g, ROOT + '\\tooling\\scripts');
    replaceInFile(path + "\\cordova\\emulate.bat",/__PATH_TO_TOOLING_SCRIPTS__/g, ROOT + '\\tooling\\scripts');
    replaceInFile(path + "\\cordova\\debug.bat",/__PATH_TO_PROJ__/g, path);
    replaceInFile(path + "\\cordova\\emulate.bat",/__PATH_TO_PROJ__/g, path);
    WScript.StdOut.WriteLine("CREATE SUCCESS.");

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


// index.html title set to project name ?
