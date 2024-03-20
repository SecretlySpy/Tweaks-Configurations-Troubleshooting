@echo off

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with admin privileges
) else (
    echo Please run the script as an Administrator!
    pause
    exit
)

:: Define common values
set "DWORD_TYPE=REG_DWORD"
set "REG_SZ_TYPE=REG_SZ"
set "BOOL_TRUE=1"
set "BOOL_FALSE=0"

:: Registry additions
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPL /t %DWORD_TYPE% /d 2 /f
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPLBoot /t %DWORD_TYPE% /d 2 /f

reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SecurityHealthService" /v "Start" /t %DWORD_TYPE% /d 2 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\wscsvc" /v "Start" /t %DWORD_TYPE% /d 2 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v "Enabled" /t %DWORD_TYPE% /d 1 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\CI\Policy" /v "VerifiedAndReputablePolicyState" /t %DWORD_TYPE% /d 1 /f
reg add "HKEY_LOCAL_MACHINE\Software\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t %REG_SZ_TYPE% /d "%BOOL_TRUE%" /f
reg add "HKEY_LOCAL_MACHINE\Software\Wow6432Node\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t %REG_SZ_TYPE% /d "%BOOL_TRUE%" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Features" /v "TamperProtection" /t %DWORD_TYPE% /d 5 /f

pause

:: Importing registry file
regedit /s %~dp0Enable Windows Security.reg /f
IF %ERRORLEVEL% EQU 0 (
  echo Enable Windows Security.reg imported successfully.
) ELSE (
  echo Enable Windows Security.reg imported failed.
)

pause

:: Execute batch file
call "%~dp0\Basic Protection Against to Unauthorized Access.bat"
IF %ERRORLEVEL% EQU 0 (
  echo Basic Protection Against to Unauthorized Access.bat executed successfully.
) ELSE (
  echo Basic Protection Against to Unauthorized Access.bat executed failed.
)

pause
