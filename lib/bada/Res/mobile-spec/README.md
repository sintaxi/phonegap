## Mobile Spec Suite ##

These specs are designed to run inside the mobile device that implements it - _it will fail in the DESKTOP browser_.

These set of tests is designed to be used with PhoneGap. You should initialize a fresh PhoneGap repository (git clone 
git://github.com/phonegap/phonegap.git) and then toss these files into the www or assets folder, replacing the
contents. Make sure you include phonegap.js - each platform directory in the PhoneGap repository has a build or make
file, which will create a phonegap.js file for you (and in most cases copy it into the www or assets folder).

The goal is to test mobile device functionality inside a mobile browser.
Where possible, the PhoneGap API lines up with HTML 5 spec. Maybe down
the road we could use this spec for parts of HTML 5, too :)


LICENSE
---

_Copyright (c) 2009 Rob Ellis, Brian LeRoux, Brock Whitten, Nitobi Software_

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.