@ECHO OFF
goto comment
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
:comment

set FOUNDNODE=
for %%e in (%PATHEXT%) do (
  for %%X in (node%%e) do (
    if not defined FOUNDNODE (
      set FOUNDNODE=%%~$PATH:X
    )
  )
)

set FOUNDNPM=
for %%X in (npm) do (
  if not defined FOUNDNPM (
    set FOUNDNPM=%%~$PATH:X
  )
)

if not defined FOUNDNODE (
  echo "npm cannot be found on the path. Aborting."
  exit /b 1
)
if not defined FOUNDNPM (
  echo "Node cannot be found on the path. Aborting."
  exit /b 1
)

@node.exe "%~dp0\check_reqs.js" %*
