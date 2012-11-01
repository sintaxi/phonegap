using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;

using Ionic.Zip;
using System.Text.RegularExpressions;

namespace tooling
{

    class CordovaBuilder
    {
        
        static void Usage()
        {
            Log("Usage: CordovaBuilder [ BuildOutputPath -c:Type ]");
            Log("    BuildOutputPath : path to save the built application");
            Log("    -c : which type of project you want to create, 0 for Metro App developers, 1 for Cordova API developers, default is 0");
            Log("examples:");
            Log("  CordovaBuilder bin\\Debug");
            Log("  CordovaBuilder bin\\Release -c:1");

        }

        static void Log(string msg)
        {
            Console.WriteLine(msg);
        }

        static void ReadWait()
        {
            Console.WriteLine("\nPress ENTER to continue...");
            Console.Read();
        }

        static private void DeleteFolder(string folder)
        {
            if (Directory.Exists(folder))
            {
                foreach (string file in Directory.GetFileSystemEntries(folder))
                {
                    if (File.Exists(file))
                    {
                        File.Delete(file);
                    }
                    else
                    {
                        DeleteFolder(file);
                    }
                }
                Directory.Delete(folder);
            }
        }

        static private void ModifyFile(string name, int userChosenType, string root, int length, string source, string result) 
        {
            if (userChosenType == 0)
            {
                byte[] byteData = new byte[length];
                char[] charData = new char[length];
                FileStream readFile;

                try
                {
                    readFile = new FileStream(root + name, FileMode.Open);
                    readFile.Read(byteData, 0, length);
                    Decoder dec = Encoding.UTF8.GetDecoder();
                    dec.GetChars(byteData, 0, byteData.Length, charData, 0);

                    string preMergeString = new string(charData);
                    
                    Regex reg = new Regex(source);
                    string ss = reg.Replace(preMergeString, result);
                    readFile.Close();
                    
                    byte[] finalData = new UTF8Encoding().GetBytes(ss);
                    FileStream writeFile = new FileStream(root + name, FileMode.Open);
                    writeFile.Write(finalData, 0, finalData.Length);
                    writeFile.Flush();
                    writeFile.Close();
                }
                catch (IOException e)
                {
                    Console.WriteLine("An IO exception has been thrown!");
                    Console.WriteLine(e.ToString());
                    Console.ReadLine();
                }
            }
        }

        static private string addToEnvironment()
        {
            // add to System Path environment.
            string path = Environment.GetEnvironmentVariable("Path");

            string[] tempArr = path.Split(';');
            string[] results = new string[tempArr.Length + 1];
            string appPath = System.Environment.CurrentDirectory + "\\";

            bool appPathExist = false;

            for (int i = 0; i < tempArr.Length; i++)
            {
                if (tempArr[i].Equals(appPath))
                {
                    appPathExist = true;
                }
                if (!tempArr[i].Contains("CordovaBuilder")) {
                    results[i] = tempArr[i];
                }
            }

            string[] appPaths = appPath.Split('\\');
            if (appPaths.Length > 5)
            {
                if (!appPathExist && appPaths[appPaths.Length - 4].Equals("CordovaBuilder"))
                {
                    results[results.Length - 1] = appPath;
                    
                    List<string> final = new List<string>();
                    for (int i = 0; i < results.Length; i++) 
                    {
                        if (!"".Equals(results[i]) && results[i] != null) 
                        {
                            final.Add(results[i]);
                        }
                        
                    }
                    string result = String.Join(";", final);

                    Environment.SetEnvironmentVariable("Path", result, EnvironmentVariableTarget.Machine);
                }
            }
            return path;
        }

        static private void createZip(int userChosenType, string[] currentResults, string outPutPath)
        {
            string basePath = "";
            string baseName = "";

            if (userChosenType == 0)
            {
                basePath = String.Join("\\", currentResults) + "\\framework\\Cordova-Metro";
                baseName = "\\Cordova-Metro.zip";
            }
            else if (userChosenType == 1)
            {
                basePath = String.Join("\\", currentResults) + "\\src";
                baseName = "\\CordovaStarter.zip";
            }

            try
            {
                using (ZipFile zip = new ZipFile())
                {
                    zip.StatusMessageTextWriter = System.Console.Out;

                    zip.AddDirectory(basePath); // recurses subdirectories

                    zip.Save(outPutPath + baseName);
                }
            }
            catch (System.Exception ex1)
            {
                System.Console.Error.WriteLine("exception: " + ex1);
            }
        
        }

        static private string[] mergeJsFiles(string path, int userChosenType)
        {
            string currentPath = Environment.GetEnvironmentVariable("Path");

            string[] currentPaths = path.Split(';');
            string[] currentTmparr = currentPaths[currentPaths.Length - 1].Split('\\');

            for (int i = 0; i < currentPaths.Length; i++)
            {
                if (currentPaths[i].EndsWith("tool\\CordovaBuilder\\CordovaBuilder\\bin\\Debug\\") || currentPaths[i].EndsWith("tool\\CordovaBuilder\\CordovaBuilder\\bin\\Release\\"))
                {
                    currentTmparr = currentPaths[i].Split('\\');
                }
            }

            string[] currentResults = new string[currentTmparr.Length - 6];

            for (int i = 0; i < currentResults.Length; i++)
            {
                currentResults[i] = currentTmparr[i];
            }
            string currentResult = String.Join("\\", currentResults) + "\\src\\cordova-win8\\js";
            string[] fileNames = Directory.GetFiles(currentResult, "*.js");
            string root = String.Join("\\", currentResults) + "\\framework\\Cordova-Metro";

            if (userChosenType == 0)
            {
                FileStream fileStream = new FileStream(root + "\\js\\cordova.js", FileMode.Create);
                BinaryWriter binaryWriter = new BinaryWriter(fileStream);
                
                FileStream stream;
                for (int i = 0; i < fileNames.Length; i++)
                {
                    stream = new FileStream(fileNames[i], FileMode.Open);
                    BinaryReader reader = new BinaryReader(stream);
                    int length = (int)stream.Length;
                    byte[] threeBytes = reader.ReadBytes(3);
                    //int ch = reader.PeekChar();
                    if (threeBytes[0] == 0xef && threeBytes[1] == 0xbb && threeBytes[2] == 0xbf)
                    {
                        length -= 3;
                    }
                    else
                    {
                        binaryWriter.Write(threeBytes);
                    }

                    binaryWriter.Write(reader.ReadBytes(length));
                    //binaryWriter.Write("\n");
                    reader.Close();
                    stream.Close();
                }
                binaryWriter.Close();
                fileStream.Close();
            }
            return currentResults;
        }

        static private void cleanProject(int userChosenType, string[] currentResults, string root)
        {
            if (userChosenType == 0)
            {
                /*string deleteFile = root + "\\js\\default.js";
                if (File.Exists(deleteFile))
                {
                    File.Delete(deleteFile);
                }*/
            }
            else if (userChosenType == 1)
            {
                DeleteFolder(String.Join("\\", currentResults) + "\\src\\cordova-win8\\bin");
                DeleteFolder(String.Join("\\", currentResults) + "\\src\\cordova-win8\\bld");
            }
        
        }


        static void Main(string[] args) 
        {
            string path = addToEnvironment();

            int userChosenType = 0;
            string outPutPath = "";

            if (args.Length < 1) 
            {
                Usage();
                ReadWait();
                return;
            }

            if (args.Length == 2) 
            {
                if (args[1].StartsWith("-c:")) 
                {
                    userChosenType = int.Parse(args[1].Substring(3));
                    if (userChosenType != 1 && userChosenType != 0)
                    {
                        Usage();
                        ReadWait();
                        return;
                    }
                }
            }

            if (Directory.Exists(args[0]))
            {
                DirectoryInfo info = new DirectoryInfo(args[0]);
                outPutPath = info.FullName;
            }
            else 
            {
                Log(string.Format("Error: could not find folder of path {0}", args[0]));
                ReadWait();
                return;
            }

            // Merge the JS files.
            string[] currentResults = mergeJsFiles(path, userChosenType);

            string root = String.Join("\\", currentResults) + "\\framework\\Cordova-Metro";
            
            // Modify the default.html.
            ModifyFile("\\default.html", userChosenType, root, 1000, "js/default.js", "js/cordova.js");
            
			// Clean the project.
            cleanProject(userChosenType, currentResults, root);

            // Create zip.
            createZip(userChosenType, currentResults, outPutPath);
         }
    }
}
