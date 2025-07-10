@echo off
setlocal enabledelayedexpansion

::----------------------------------------------------------------------
:: 1. Check for Administrative Privileges
::----------------------------------------------------------------------
echo Checking for administrator privileges...
net session >nul 2>&1
if !errorLevel! neq 0 (
    echo ERROR: This script requires administrator privileges.
    echo Please right-click the script and select "Run as administrator".
    pause
    exit /b 1
)
echo Success: Running with administrator privileges.
echo.

::----------------------------------------------------------------------
:: 2. Apply Core Security Registry Settings
::----------------------------------------------------------------------
echo Applying core security registry settings...

:: Enable LSA Protection (PPL) - Requires Win 8.1+
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPL /t REG_DWORD /d 2 /f
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPLBoot /t REG_DWORD /d 2 /f

:: Set Windows Security Services to Automatic Start
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SecurityHealthService" /v "Start" /t REG_DWORD /d 2 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\wscsvc" /v "Start" /t REG_DWORD /d 2 /f

:: Enable Hypervisor-Enforced Code Integrity (HVCI) - Requires hardware support
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v "Enabled" /t REG_DWORD /d 1 /f

:: Enable stricter certificate padding checks
reg add "HKEY_LOCAL_MACHINE\Software\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "1" /f
reg add "HKEY_LOCAL_MACHINE\Software\Wow6432Node\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "1" /f

:: Attempt to enable Tamper Protection for Microsoft Defender
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Features" /v "TamperProtection" /t REG_DWORD /d 5 /f

echo Core registry settings applied.
echo.

::----------------------------------------------------------------------
:: 3. Import External Registry File
:: Note: The contents of this file are unknown and critical to the script's effect.
::----------------------------------------------------------------------
if exist "%~dp0Enable Windows Security.reg" (
    echo Importing "Enable Windows Security.reg"...
    regedit /s "%~dp0Enable Windows Security.reg"
    echo Import command executed.
) else (
    echo WARNING: "Enable Windows Security.reg" not found. Skipping.
)
echo.

::----------------------------------------------------------------------
:: 4. Execute External Batch File
:: Note: The contents of this file are unknown and critical to the script's effect.
::----------------------------------------------------------------------
if exist "%~dp0Basic Protection Against to Unauthorized Access.bat" (
    echo Executing "Basic Protection Against to Unauthorized Access.bat"...
    call "%~dp0\Basic Protection Against to Unauthorized Access.bat"
    if !errorLevel! equ 0 (
      echo External script executed successfully.
    ) else (
      echo WARNING: External script may have failed. Errorlevel: !errorLevel!
    )
) else (
    echo WARNING: "Basic Protection Against to Unauthorized Access.bat" not found. Skipping.
)
echo.

echo ----------------------------------------------------------------------
echo Security script has finished.
echo IMPORTANT: A reboot is required for many of these settings to take effect.
echo ----------------------------------------------------------------------
pause