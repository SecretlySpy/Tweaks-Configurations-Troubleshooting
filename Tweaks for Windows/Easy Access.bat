@echo off
title GSecurity & color 0b

:: elevation
set "params=%*"
cd /d "%~dp0" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )

:: job
C:
CD\
icacls a: /grant Everyone:F

icacls b: /grant Everyone:F


takeown /f c:
icacls c: /grant "Everyone"

icacls d: /grant Everyone:F

icacls e: /grant Everyone:F

icacls f: /grant Everyone:F

icacls g: /grant Everyone:F

icacls h: /grant Everyone:F

icacls i: /grant Everyone:F

icacls j: /grant Everyone:F

icacls k: /grant Everyone:F

icacls l: /grant Everyone:F

icacls m: /grant Everyone:F

icacls n: /grant Everyone:F

icacls o: /grant Everyone:F

icacls p: /grant Everyone:F

icacls q: /grant Everyone:F

icacls r: /grant Everyone:F

icacls s: /grant Everyone:F

icacls t: /grant Everyone:F

icacls u: /grant Everyone:F

icacls v: /grant Everyone:F

icacls w: /grant Everyone:F

icacls x: /grant Everyone:F

icacls y: /grant Everyone:F

icacls z: /grant Everyone:F


:: exit
exit