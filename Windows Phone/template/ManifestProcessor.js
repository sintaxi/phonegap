
var objArgs = WScript.Arguments;
for (i = 0; i < objArgs.length; i++)
{
   WScript.Echo("Arg :: " + objArgs(i));
}


var fso = WScript.CreateObject("Scripting.FileSystemObject");

var folder = fso.GetFolder("..\\..\\www");

var outFile = fso.CreateTextFile("..\\..\\GapSourceDictionary.xml", true);

outFile.WriteLine('<?xml version="1.0" encoding="utf-8"?>');
outFile.WriteLine('<!-- This file is auto-generated, do not edit! -jm -->');
outFile.WriteLine('<GapSourceDictionary>');

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

outFile.WriteLine('</GapSourceDictionary>');

