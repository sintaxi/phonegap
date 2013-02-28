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


/*************************************************/
/****************  REQUIREMENTS  *****************/
/*************************************************/
/*
Paths:
  - path to git.exe  -> C:\msysgit\bin
  - path to msbuild -> C:\Windows\Microsoft.NET\Framework\v4.0.30319
Famework
  - .NET 4.0
  - Windows phone SDKs


/************ Globals ********/

var fso = WScript.CreateObject('Scripting.FileSystemObject'),
    wscript_shell = WScript.CreateObject("WScript.Shell");

//Replace root directory or create new directory?
var REPLACE = false;

//Set up directory structure of current release
    //arguments passed in
var args = WScript.Arguments,
    //Root folder of cordova-wp7 (i.e C:\Cordova\cordova-wp7)
    ROOT = WScript.ScriptFullName.split('\\tooling\\', 1),
    // tooling scripts
    SCRIPTS = '\\tooling\\scripts';
    //Get version number
    VERSION=read(ROOT+'\\VERSION').replace(/\r\n/,'').replace(/\n/,''),
    //Git Repositories
    CORDOVA_JS = "git://github.com/apache/cordova-js.git";

//Destination to build to
var BUILD_DESTINATION;


/*************************************************/
/****************  FUNCTIONS  ********************/
/*************************************************/


// help function
function Usage()
{
  WScript.StdOut.WriteLine("");
  WScript.StdOut.WriteLine("This is a command line tool for building new releases.")
  WScript.StdOut.WriteLine("Usage: dist <NEW_PATH_FOR_BUILD>");
  WScript.StdOut.WriteLine("Creates and packages a new cordova/wp7 project, reversioning");
  WScript.StdOut.WriteLine("it to match the VERSION file in the root directory.");
  WScript.StdOut.WriteLine("");
}


// returns the contents of a file
function read(filename) {
    //WScript.Echo('Reading in ' + filename);
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

// executes a commmand in the shell
function exec(command) {
    //WScript.StdOut.WriteLine("Command: " + command);
    var oShell=wscript_shell.Exec(command);
    while (oShell.Status != 1) {
        while(!oShell.StdOut.AtEndOfStream) {
            var line = oShell.StdOut.ReadLine();
            // XXX: Change to verbose mode
            WScript.StdOut.WriteLine(line);
        }
        WScript.sleep(100);
    }
}


/*************************************************/
/**************  MAIN SCRIPT  ********************/
/*************************************************/

if(REPLACE)
{
    BUILD_DESTINATION = ROOT;
}
else if(args.Count() > 0)
{
    BUILD_DESTINATION = args(0);
    //Support help flags
    if(BUILD_DESTINATION.indexOf("--help") > -1 ||
         BUILD_DESTINATION.indexOf("/?") > -1 )
    {
        Usage();
        WScript.Quit(1);
    }

}
else
{
    Usage();
    WScript.Quit(1);
}


/*************************************************/
/******************  Step 1  *********************/
/*************************************************/
/** - Copy source code to new directory         **/
/*************************************************/

exec('cscript ' + ROOT + SCRIPTS + '\\new.js ' + BUILD_DESTINATION + ' //nologo');


/*************************************************/
/******************  Step 2  *********************/
/*************************************************/
/** - Retag everything with new version numbers **/
/** - Delete any generated files and cordova.js **/
/** - Rebuild dll                               **/
/*************************************************/

exec('cscript ' + BUILD_DESTINATION + SCRIPTS + '\\reversion.js ' + VERSION + ' //nologo');


/*************************************************/
/******************  Step 3  *********************/
/*************************************************/
/** - Download tagged version of cordova.js     **/
/** - build cordova.js                          **/
/** - windows.cordova.js -> templates + example **/
/*************************************************/

exec('cscript ' + BUILD_DESTINATION + SCRIPTS + '\\buildjs.js //nologo');


/*************************************************/
/******************  Step 5  *********************/
/*************************************************/
/** - Build templates                           **/
/** - Zip templates                             **/
/** - inject into Visual Studio                 **/
/*************************************************/

exec('cscript ' + BUILD_DESTINATION + SCRIPTS + '\\package.js //nologo');