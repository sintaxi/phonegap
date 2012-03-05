
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

