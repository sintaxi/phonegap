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

var objArgs = WScript.Arguments;
for (i = 0; i < objArgs.length; i++)
{
   WScript.Echo("Arg :: " + objArgs(i));
}

var projectFilePath = null;
if(objArgs && objArgs.length > 0)
{
    projectFilePath = objArgs(0);
}


var fso = WScript.CreateObject("Scripting.FileSystemObject");

var folder = fso.GetFolder("..\\..\\www");

var outFile = fso.CreateTextFile("..\\..\\CordovaSourceDictionary.xml", true);

outFile.WriteLine('<?xml version="1.0" encoding="utf-8"?>');
outFile.WriteLine('<!-- This file is auto-generated, do not edit! -jm -->');
outFile.WriteLine('<CordovaSourceDictionary>');

function enumerateFolder(folder,parentPath)
{
	var files = new Enumerator(folder.files);
	while(!files.atEnd())
	{
		WScript.Echo(parentPath + "\\" + fso.GetFileName(files.item()));
		outFile.WriteLine('    <FilePath Value="' + parentPath + "\\" + fso.GetFileName(files.item()) + '"/>');
		files.moveNext();
	}

	var subFolders = new Enumerator(folder.SubFolders);
	while(!subFolders.atEnd())
	{
		var item = subFolders.item();
		enumerateFolder(item, parentPath + "\\" + fso.GetFileName(item));
		subFolders.moveNext();
	}
}
enumerateFolder(folder,"www");

// Next we need to get any Linked files from the project

WScript.Echo("Adding Linked Files ...");
if(projectFilePath != null)
{
    var projXml =  WScript.CreateObject("Microsoft.XMLDOM");
    
    projXml.async = false;
    if(projXml.load(projectFilePath))
    {
        var nodes = projXml.selectNodes("Project/ItemGroup/Content/Link");
        WScript.Echo("nodes.length" + nodes.length);
        for(var n = 0; n < nodes.length; n++)
        {
            outFile.WriteLine('    <FilePath Value="' + nodes[n].text + '"/>');
        }
    }
}

outFile.WriteLine('</CordovaSourceDictionary>');

