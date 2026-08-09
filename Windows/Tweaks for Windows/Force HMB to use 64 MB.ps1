# ================================
# Configure HMB for listed devices
# ================================

# ======== self‑elevate if not admin ========
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
    Write-Host "⚠️  Elevation required. Requesting administrative privileges..."
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# ======== main logic wrapped in try/catch ========
try {
    # ======== configure ========
    $DeviceIDs = @(
        "VEN_15B7&DEV_5006&REV_??",
        "VEN_15B7&DEV_5008&REV_??",
        "VEN_15B7&DEV_5017&REV_??",
        "VEN_15B7&DEV_5023&REV_??",
        "VEN_15B7&DEV_5041&REV_??",
        "VEN_2646&DEV_2262&REV_??",
        "VEN_2646&DEV_5013&REV_??",
        "VEN_1344&DEV_5409&REV_??",
        "VEN_144D&DEV_A808&REV_??",
        "VEN_144D&DEV_A809&REV_??",
        "VEN_1179&DEV_0219&REV_??",
        "VEN_1D85&DEV_2263&REV_??",
        "VEN_1CC1&DEV_3341&REV_??",
        "VEN_1CC1&DEV_2262&REV_??"
    )
    $HMBSizeBytes = 67108864  # 64MB safe value

    # ======== build data ========
    $strings = @()
    foreach ($id in $DeviceIDs) {
        $strings += $id
        $strings += "$HMBSizeBytes"
    }

    # ======== convert to UTF-16LE with null terminators ========
    $bytes = @()
    foreach ($s in $strings) {
        foreach ($c in $s.ToCharArray()) {
            $bytes += [byte][char]$c
            $bytes += 0
        }
        $bytes += 0
        $bytes += 0
    }
    $bytes += 0
    $bytes += 0

    # ======== write to registry ========
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\stornvme\Parameters\Device"
    New-ItemProperty -Path $regPath -Name "HostMemoryBufferBytes" -PropertyType MultiString -Force | Out-Null
    Set-ItemProperty -Path $regPath -Name "HostMemoryBufferBytes" -Value $strings

    Write-Host "✅ HostMemoryBufferBytes updated for $($DeviceIDs.Count) devices with HMB size $HMBSizeBytes bytes."
}
catch {
    Write-Host "❌ An error occurred while applying HMB settings."
    Write-Host "Error details: $($_.Exception.Message)"
    Start-Sleep -Seconds 5
    exit 1
}

# ======== auto close ========
Start-Sleep -Seconds 1
exit
