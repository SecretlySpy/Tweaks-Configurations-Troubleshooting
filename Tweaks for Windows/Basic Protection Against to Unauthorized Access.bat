@echo off
title GSecurity & color 0b

:: elevation
set "params=%*"
cd /d "%~dp0" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )

:: job
C:
CD\
icacls a: /grant Administrators:F
icacls a: /grant System:F
icacls a: /grant Users:r
icacls a: /remove "Authenticated Users"
icacls a: /remove "Everyone"

icacls b: /grant Administrators:F
icacls b: /grant System:F
icacls b: /grant Users:r
icacls b: /remove "Authenticated Users"
icacls b: /remove "Everyone"

takeown /f c:
icacls c: /remove "Authenticated Users"

icacls d: /grant Administrators:F
icacls d: /grant System:F
icacls d: /grant Users:r
icacls d: /remove "Authenticated Users"
icacls d: /remove "Everyone"

icacls e: /grant Administrators:F
icacls e: /grant System:F
icacls e: /grant Users:r
icacls e: /remove "Authenticated Users"
icacls e: /remove "Everyone"

icacls f: /grant Administrators:F
icacls f: /grant System:F
icacls f: /grant Users:r
icacls f: /remove "Authenticated Users"
icacls f: /remove "Everyone"

icacls g: /grant Administrators:F
icacls g: /grant System:F
icacls g: /grant Users:r
icacls g: /remove "Authenticated Users"
icacls g: /remove "Everyone"

icacls h: /grant Administrators:F
icacls h: /grant System:F
icacls h: /grant Users:r
icacls h: /remove "Authenticated Users"
icacls h: /remove "Everyone"

icacls i: /grant Administrators:F
icacls i: /grant System:F
icacls i: /grant Users:r
icacls i: /remove "Authenticated Users"
icacls i: /remove "Everyone"

icacls j: /grant Administrators:F
icacls j: /grant System:F
icacls j: /grant Users:r
icacls j: /remove "Authenticated Users"
icacls j: /remove "Everyone"

icacls k: /grant Administrators:F
icacls k: /grant System:F
icacls k: /grant Users:r
icacls k: /remove "Authenticated Users"
icacls k: /remove "Everyone"

icacls l: /grant Administrators:F
icacls l: /grant System:F
icacls l: /grant Users:r
icacls l: /remove "Authenticated Users"
icacls l: /remove "Everyone"

icacls m: /grant Administrators:F
icacls m: /grant System:F
icacls m: /grant Users:r
icacls m: /remove "Authenticated Users"
icacls m: /remove "Everyone"

icacls n: /grant Administrators:F
icacls n: /grant System:F
icacls n: /grant Users:r
icacls n: /remove "Authenticated Users"
icacls n: /remove "Everyone"

icacls o: /grant Administrators:F
icacls o: /grant System:F
icacls o: /grant Users:r
icacls o: /remove "Authenticated Users"
icacls o: /remove "Everyone"

icacls p: /grant Administrators:F
icacls p: /grant System:F
icacls p: /grant Users:r
icacls p: /remove "Authenticated Users"
icacls p: /remove "Everyone"

icacls q: /grant Administrators:F
icacls q: /grant System:F
icacls q: /grant Users:r
icacls q: /remove "Authenticated Users"
icacls q: /remove "Everyone"

icacls r: /grant Administrators:F
icacls r: /grant System:F
icacls r: /grant Users:r
icacls r: /remove "Authenticated Users"
icacls r: /remove "Everyone"

icacls s: /grant Administrators:F
icacls s: /grant System:F
icacls s: /grant Users:r
icacls s: /remove "Authenticated Users"
icacls s: /remove "Everyone"

icacls t: /grant Administrators:F
icacls t: /grant System:F
icacls t: /grant Users:r
icacls t: /remove "Authenticated Users"
icacls t: /remove "Everyone"

icacls u: /grant Administrators:F
icacls u: /grant System:F
icacls u: /grant Users:r
icacls u: /remove "Authenticated Users"
icacls u: /remove "Everyone"

icacls v: /grant Administrators:F
icacls v: /grant System:F
icacls v: /grant Users:r
icacls v: /remove "Authenticated Users"
icacls v: /remove "Everyone"

icacls w: /grant Administrators:F
icacls w: /grant System:F
icacls w: /grant Users:r
icacls w: /remove "Authenticated Users"
icacls w: /remove "Everyone"

icacls x: /grant Administrators:F
icacls x: /grant System:F
icacls x: /grant Users:r
icacls x: /remove "Authenticated Users"
icacls x: /remove "Everyone"

icacls y: /grant Administrators:F
icacls y: /grant System:F
icacls y: /grant Users:r
icacls y: /remove "Authenticated Users"
icacls y: /remove "Everyone"

icacls z: /grant Administrators:F
icacls z: /grant System:F
icacls z: /grant Users:r
icacls z: /remove "Authenticated Users"
icacls z: /remove "Everyone"

:: exit
exit