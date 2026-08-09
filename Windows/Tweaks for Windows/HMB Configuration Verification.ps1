# ======== self-elevate if not admin ========
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
    Write-Host "[!] Elevation required. Requesting administrative privileges..."
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# ======== read from registry ========
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\stornvme\Parameters\Device"
$value = (Get-ItemProperty -Path $regPath -Name "HostMemoryBufferBytes").HostMemoryBufferBytes

Write-Host "[i] Checking HostMemoryBufferBytes..."
for ($i = 0; $i -lt $value.Count; $i += 2) {
    $deviceId = $value[$i]
    $hmbSize  = $value[$i+1]
    Write-Host ("Device: {0}  =>  HMB Size: {1} bytes" -f $deviceId, $hmbSize)
}

# ======== pause so you can view results ========
Write-Host ""
Write-Host "Press any key to exit..."
[void][System.Console]::ReadKey($true)
