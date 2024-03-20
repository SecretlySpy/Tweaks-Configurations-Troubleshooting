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
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPL /t REG_DWORD /d 0 /f
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v RunAsPPLBoot /t REG_DWORD /d 0 /f

reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\SecurityHealthService" /v "Start" /t REG_DWORD /d 4 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\wscsvc" /v "Start" /t REG_DWORD /d 4 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" /v "Enabled" /t REG_DWORD /d 0 /f
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\CI\Policy" /v "VerifiedAndReputablePolicyState" /t REG_DWORD /d 0 /f
reg add "HKEY_LOCAL_MACHINE\Software\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "0" /f
reg add "HKEY_LOCAL_MACHINE\Software\Wow6432Node\Microsoft\Cryptography\Wintrust\Config" /v "EnableCertPaddingCheck" /t REG_SZ /d "0" /f
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Features" /v "TamperProtection" /t REG_DWORD /d 0 /f

:: Wait for user acknowledgment
pause

:: Import Registry File
regedit /s "%~dp0Disable Windows Security.reg" /f
IF %ERRORLEVEL% EQU 0 (
  echo Disable Windows Security.reg imported successfully.
) ELSE (
  echo Disable Windows Security.reg import failed.
)

:: Wait for user acknowledgment
pause

:: Execute Easy Access batch file
call "%~dp0Easy Access.bat"
IF %ERRORLEVEL% EQU 0 (
  echo Easy Access.bat executed successfully.
) ELSE (
  echo Easy Access.bat execution failed.
)

:: Wait for user acknowledgment
pause
