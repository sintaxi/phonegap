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
    wscript_shell = WScript.CreateObject("WScript.Shell");


function Usage()
{
    WScript.StdOut.WriteLine("");
    WScript.StdOut.WriteLine("Usage: build [ PathTOProjectFolder ]");
    WScript.StdOut.WriteLine("    PathTOProjectFolder : The path to the project being built");
    WScript.StdOut.WriteLine("examples:");
    WScript.StdOut.WriteLine("    build C:\\Users\\anonymous\\Desktop\\MyProject");
    WScript.StdOut.WriteLine("");
}

// exicutes a commmand in the shell
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

// builds the project and .xap
function build(path)
{
    WScript.StdOut.WriteLine("Building Cordova-WP8 Project:");
    WScript.StdOut.WriteLine("\tDirectory : " + path);

    // delete any previously generated files
    if(fso.FolderExists(path + "\\obj"))
    {
        fso.DeleteFolder(path + "\\obj");
    }
    if(fso.FolderExists(path + "\\Bin"))
    {
        fso.DeleteFolder(path + "\\Bin");
    }
    
    wscript_shell.CurrentDirectory = path;
    exec('msbuild CordovaAppProj.csproj');

    WScript.StdOut.WriteLine("BUILD SUCCESS.");
}

var args = WScript.Arguments;

WScript.StdOut.WriteLine("");

if(args.Count() > 0)
{
    // support help flags
    if(args(0) == "--help" || args(0) == "/?" ||
            args(0) == "help" || args(0) == "-help" || args(0) == "/help")
    {
        Usage();
        WScript.Quit(1);
    }
    else
    {
        if(fso.FolderExists(args(0)))
        {
            build(args(0));
        }
        else
        {
            WScript.StdOut.WriteLine("Could not find project directory.");
            Usage();
            WScript.StdOut.WriteLine("BUILD FAILED.");
            WScript.Quit(1);
        }
    }
}
else
{
    Usage();
    WScript.Quit(1);
}
