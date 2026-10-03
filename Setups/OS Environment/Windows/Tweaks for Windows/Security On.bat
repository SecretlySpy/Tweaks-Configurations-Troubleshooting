@echo off
setlocal

:: ===========================================================================
:: Administrator Elevation (standardized, XP -> 11)
:: Self-elevates instead of only warning: `net session` returns 0 when already
:: elevated, otherwise relaunch via PowerShell RunAs (VBS fallback if absent).
:: ===========================================================================
net session >nul 2>&1
if %errorlevel% equ 0 goto :gotAdmin
echo Requesting administrator privileges...
if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
) else (
    > "%temp%\ssp_elevate.vbs" echo Set U = CreateObject^("Shell.Application"^)
    >>"%temp%\ssp_elevate.vbs" echo U.ShellExecute "%~f0", "", "", "runas", 1
    cscript //nologo "%temp%\ssp_elevate.vbs" >nul 2>&1
    del "%temp%\ssp_elevate.vbs" >nul 2>&1
)
exit /b

:gotAdmin
echo Success: Running with administrator privileges.
echo.

:: ===========================================================================
:: Windows 10+ guard
:: HVCI and registry-based Tamper Protection are Windows 10+ features (LSA PPL
:: is 8.1+). The bundled "Enable Windows Security.reg" also uses ASR rules and
:: Controlled Folder Access (10 1709+) and auto-DoH (11). Refuse cleanly below 10.
:: ===========================================================================
set "_maj=0"
for /f "tokens=2 delims=[]" %%i in ('ver') do set "_v=%%i"
for /f "tokens=2 delims=. " %%a in ("%_v%") do set "_maj=%%a"
if %_maj% LSS 10 (
    echo   This script targets Windows 10/11 security features. Detected major %_maj%.
    echo   No changes have been made.
    pause
    exit /b 1
)

echo Applying core security registry settings...

:: Enable LSA Protection (PPL) so credentials in lsass are harder to steal.
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPL /t REG_DWORD /d 2 /f
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPLBoot /t REG_DWORD /d 2 /f

:: Set the Windows Security services to start automatically.
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SecurityHealthService" /v "Start" /t REG_DWORD /d 2 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\wscsvc" /v "Start" /t REG_DWORD /d 2 /f

:: Enable Hypervisor-Enforced Code Integrity (HVCI). Requires hardware support.
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v "Enabled" /t REG_DWORD /d 1 /f

:: Enable stricter certificate padding checks (both native and WOW64 views).
reg add "HKEY_LOCAL_MACHINE\Software\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "1" /f
reg add "HKEY_LOCAL_MACHINE\Software\Wow6432Node\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "1" /f

:: Attempt to enable Tamper Protection.
:: NOTE: Tamper Protection is enforced by Microsoft Defender itself, so this
:: registry write is frequently reverted or ignored. If it does not stick,
:: enable it in Windows Security -> Virus & threat protection settings.
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Features" /v "TamperProtection" /t REG_DWORD /d 5 /f

echo Core registry settings applied.
echo.

:: Import the external hardening pack (ASR rules, Controlled Folder Access,
:: real-time protection, DoH, SMBv1 off). UTF-16 LE .reg - do not re-encode.
if exist "%~dp0Enable Windows Security.reg" (
    echo Importing "Enable Windows Security.reg"...
    regedit /s "%~dp0Enable Windows Security.reg"
    echo Import command executed.
) else (
    echo WARNING: "Enable Windows Security.reg" not found. Skipping.
)
echo.

:: Run the firewall / auditing / SMBv1 hardening script (self-detects OS).
if exist "%~dp0Basic Protection Against to Unauthorized Access.bat" (
    echo Executing "Basic Protection Against to Unauthorized Access.bat"...
    call "%~dp0Basic Protection Against to Unauthorized Access.bat"
) else (
    echo WARNING: "Basic Protection Against to Unauthorized Access.bat" not found. Skipping.
)
echo.

echo ----------------------------------------------------------------------
echo Security script has finished.
echo IMPORTANT: A reboot is required for many of these settings to take effect.
echo ----------------------------------------------------------------------
pause
exit /b
