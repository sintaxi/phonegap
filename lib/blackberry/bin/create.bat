@ECHO OFF
IF NOT DEFINED JAVA_HOME GOTO MISSING
FOR %%X in (ant.bat) do (
    SET FOUND=%%~$PATH:X
    IF NOT DEFINED FOUND GOTO MISSING
)
cscript %~dp0\create.js %*
GOTO END
:MISSING
ECHO Missing one of the following:
ECHO JDK: http://java.oracle.com
ECHO Apache ant: http://ant.apache.org
EXIT /B 1
:END
