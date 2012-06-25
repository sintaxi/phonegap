// Guids.cs
// MUST match guids.h
using System;

namespace Microsoft.vspackage1
{
    static class GuidList
    {
        public const string guidvspackage1PkgString = "d5c0d96c-110c-41a0-8224-51bcba658426";
        public const string guidvspackage1CmdSetString = "7f9800fa-9b5e-4286-b22a-783ae28cb526";

        public static readonly Guid guidvspackage1CmdSet = new Guid(guidvspackage1CmdSetString);
    };
}