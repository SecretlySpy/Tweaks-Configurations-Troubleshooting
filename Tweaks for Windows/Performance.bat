@echo off
title Optimizing Windows & color 0b

:: Check for administrative privileges and elevate if necessary
cd /d "%~dp0" && (
    if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs"
) && (
    fsutil dirty query %systemdrive% 1>nul 2>nul || (
        echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/k cd ""%~sdp0"" && %~s0 %*", "", "runas", 1 >> "%temp%\getadmin.vbs"
        "%temp%\getadmin.vbs" && exit /B
    )
)

:: Removing The Intel Dynamic Platform and Thermal Framework (DPTF)
echo Removing The Intel Dynamic Platform and Thermal Framework (DPTF)...
PNPUTIL /disable-device /deviceid "*INT3400" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3402" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3403" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3404" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3407" >nul 2>&1
PNPUTIL /disable-device /deviceid "*INT3409" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_1603&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_1903&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_8A03&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_9C24&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_A131&CC_1180" >nul 2>&1
PNPUTIL /disable-device /deviceid "PCI\VEN_8086&DEV_9A03&CC_1180" >nul 2>&1
if %errorlevel% equ 0 (
    echo DPTF removal succeeded.
) else (
    echo DPTF removal failed.
)

pause

:: Optimizing Network Connection
echo Optimizing Network Connection...
netsh int tcp set global chimney=enabled >nul 2>&1
netsh int tcp set heuristics disabled >nul 2>&1
netsh int tcp set global autotuninglevel=normal >nul 2>&1
netsh int tcp set supplemental custom congestionprovider=ctcp >nul 2>&1
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\Psched" /v NonBestEffortLimit /t REG_DWORD /d 0 /f >nul 2>&1
if %errorlevel% equ 0 (
    echo Network optimization succeeded.
) else (
    echo Network optimization failed.
)

pause

:: Importing Power Plans
echo Importing Power Plans...
powercfg -Import "%~dp0UPC.pow" >nul 2>&1
powercfg -Import "%~dp0HPC.pow" >nul 2>&1
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1
if %errorlevel% equ 0 (
    echo Power plans import succeeded.
) else (
    echo Power plans import failed.
)

pause

:: Removing High Precision Event Timer (HPET)
echo Removing High Precision Event Timer (HPET)...
bcdedit /deletevalue useplatformclock >nul 2>&1
bcdedit /set disabledynamictick yes >nul 2>&1
if %errorlevel% equ 0 (
    echo HPET removal succeeded.
) else (
    echo HPET removal failed.
)

pause

:: Enabling AVX
echo Enabling AVX...
bcdedit /set xsavedisable 0 >nul 2>&1
if %errorlevel% equ 0 (
    echo AVX enabling succeeded.
) else (
    echo AVX enabling failed.
)

pause

:: Import Registry Tweaks
echo Importing Registry Tweaks...
regedit /s "%~dp0Registry Tweaks to Make Windows Faster.reg" >nul 2>&1
if %errorlevel% equ 0 (
    echo Registry Tweaks import succeeded.
) else (
    echo Registry Tweaks import failed.
)

pause

:: Displaying message for TakeControl.reg import
echo Importing TakeControl.reg...
regedit /s "%~dp0TakeControl.reg" >nul 2>&1
if %errorlevel% equ 0 (
    echo TakeControl.reg imported successfully.
) else (
    echo TakeControl.reg import failed.
)

pause
