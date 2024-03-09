@echo off
title Compressed Windows for smaller size
cls
echo ============================================================================
echo # Compressed Windows for smaller size
echo ============================================================================
cd\
Compact /CompactOS:always

:: Define paths to compact
set "paths=%programFiles(x86)%" "%programFiles%" "C:\ProgramData" "C:\Users" "%windir%\Assembly" "%windir%\InfusedApps" "%windir%\Panther" "%windir%\SoftwareDistribution" "%windir%\System32\Catroot2" "%windir%\System32\LogFiles"

:: Compact files and directories
for %%p in (%paths%) do (
    compact /c /s /a /i /exe:lzx "%%~p\*"
)

