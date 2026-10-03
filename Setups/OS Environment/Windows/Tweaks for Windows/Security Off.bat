@echo off
setlocal

:: ======================================================================
::  WARNING: DANGEROUS SCRIPT
::  This script is designed to DISABLE critical Windows security
::  features. Running this will make your computer significantly
::  more vulnerable to attacks.
::
::  PROCEED WITH EXTREME CAUTION.
:: ======================================================================
echo.
echo WARNING: This script will disable core Windows security features.
echo Press Ctrl+C now to cancel, or press any key to continue...
pause >nul

::----------------------------------------------------------------------
:: 1. Check for Administrative Privileges
::----------------------------------------------------------------------
echo.
echo Checking for administrator privileges...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ERROR: This script requires administrator privileges.
    echo Please right-click the script and select "Run as administrator".
    pause
    exit /b 1
)
echo Success: Running with administrator privileges.

::----------------------------------------------------------------------
:: 2. Disable Core Security Registry Settings
::----------------------------------------------------------------------
echo.
echo Applying registry changes to DISABLE security features...

:: Disable LSA Protection (PPL)
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPL /t REG_DWORD /d 0 /f
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPLBoot /t REG_DWORD /d 0 /f

:: Disable Windows Security Services
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SecurityHealthService" /v "Start" /t REG_DWORD /d 4 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\wscsvc" /v "Start" /t REG_DWORD /d 4 /f

:: Disable Hypervisor-Enforced Code Integrity (HVCI)
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v "Enabled" /t REG_DWORD /d 0 /f

:: Disable stricter certificate padding checks
reg add "HKEY_LOCAL_MACHINE\Software\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "0" /f
reg add "HKEY_LOCAL_MACHINE\Software\Wow6432Node\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "0" /f

:: Attempt to disable Tamper Protection for Microsoft Defender
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Features" /v "TamperProtection" /t REG_DWORD /d 0 /f

echo Core security features have been disabled via the registry.

::----------------------------------------------------------------------
:: 3. Import External Registry File
::----------------------------------------------------------------------
echo.
if exist "%~dp0Disable Windows Security.reg" (
    echo Importing "Disable Windows Security.reg"...
    regedit /s "%~dp0Disable Windows Security.reg"
    echo Import command executed.
) else (
    echo INFO: "Disable Windows Security.reg" not found. Skipping.
)

::----------------------------------------------------------------------
:: 4. Execute External Batch File
::----------------------------------------------------------------------
echo.
if exist "%~dp0Easy Access.bat" (
    echo Executing "Easy Access.bat"...
    call "%~dp0\Easy Access.bat"
    if %ERRORLEVEL% equ 0 (
      echo External script executed successfully.
    ) else (
      echo WARNING: External script may have failed. Errorlevel: %ERRORLEVEL%
    )
) else (
    echo INFO: "Easy Access.bat" not found. Skipping.
)

::----------------------------------------------------------------------
echo.
echo ======================================================================
echo Security weakening script has finished.
echo IMPORTANT: A reboot is required for these changes to take full effect.
echo Your computer is now less secure.
echo ======================================================================
pause