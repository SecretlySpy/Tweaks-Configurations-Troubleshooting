@echo off
title Compressed Windows for smaller size&cls&echo ============================================================================&echo # Compressed Windows for smaller size&echo ============================================================================
cd\
Compact /CompactOS:always
compact /c /s /a /i /exe:lzx %programFiles(x86)%\*
compact /c /s /a /i /exe:lzx %programFiles%
compact /c /s /a /i /exe:lzx "C:\ProgramData\*"
compact /c /s /a /i /exe:lzx "C:\Users\*"
compact /c /s /a /i /exe:lzx %windir%\Assembly\*
compact /c /s /a /i /exe:lzx %windir%\InfusedApps\*
compact /c /s /a /i /exe:lzx %windir%\Panther\*
compact /c /s /a /i /exe:lzx %windir%\SoftwareDistribution\*
compact /c /s /a /i /exe:lzx %windir%\System32\Catroot2\*
compact /c /s /a /i /exe:lzx %windir%\System32\LogFiles\*
