// Structured fidelity data extracted directly from the original source documents
// (PDFs, DOCX, scripts) to preserve tables, images, headings, and instructional flow.

export function getGuideFidelityData(guideId) {
  switch (guideId) {
    case 'windows-block-driver-installation':
      return {
        media: [
          {
            id: 'driver-hardware-ids',
            filename: '01-device-manager-hardware-ids.png',
            src: '/assets/guides/windows-block-driver-installation/01-device-manager-hardware-ids.png',
            alt: 'Device Manager properties dialog displaying Hardware IDs for the target device',
            caption: 'Figure 1: In Device Manager, right-click the device, choose Properties > Details tab, and select Hardware Ids from the Property dropdown.',
            width: 400,
            height: 455,
          },
          {
            id: 'group-policy-device-restrictions',
            filename: '02-group-policy-device-installation-restrictions.png',
            src: '/assets/guides/windows-block-driver-installation/02-group-policy-device-installation-restrictions.png',
            alt: 'Local Group Policy Editor navigating to Device Installation Restrictions',
            caption: 'Figure 2: Navigate to Computer Configuration > Administrative Templates > System > Device Installation > Device Installation Restrictions.',
            width: 400,
            height: 455,
          },
          {
            id: 'prevent-installation-policy',
            filename: '03-prevent-installation-policy.png',
            src: '/assets/guides/windows-block-driver-installation/03-prevent-installation-policy.png',
            alt: 'Group Policy setting: Prevent installation of devices that match any of these device IDs',
            caption: "Figure 3: Open 'Prevent installation of devices that match any of these device IDs' and set the state to Enabled.",
            width: 823,
            height: 530,
          },
          {
            id: 'show-hardware-ids-dialog',
            filename: '04-show-hardware-ids-dialog.png',
            src: '/assets/guides/windows-block-driver-installation/04-show-hardware-ids-dialog.png',
            alt: 'Show Contents dialog box entering the copied Hardware ID',
            caption: "Figure 4: Click the 'Show...' button in the Options pane and paste the Hardware ID value copied from Device Manager.",
            width: 686,
            height: 636,
          },
          {
            id: 'device-manager-blocked-status',
            filename: '05-device-manager-blocked-status.png',
            src: '/assets/guides/windows-block-driver-installation/05-device-manager-blocked-status.png',
            alt: 'Device Manager properties verifying driver installation prevention policy is active',
            caption: 'Figure 5: Device Manager displays that installation of this device is forbidden by system policy.',
            width: 823,
            height: 530,
          },
          {
            id: 'windows-unable-to-install-notification',
            filename: '06-windows-unable-to-install-notification.png',
            src: '/assets/guides/windows-block-driver-installation/06-windows-unable-to-install-notification.png',
            alt: 'Windows taskbar notification: Device driver software was not successfully installed',
            caption: 'Figure 6: Windows alerts that the device driver installation was blocked by administrative policy.',
            width: 235,
            height: 51,
          },
        ],
        tables: [],
        guidedSteps: [
          {
            id: 'block-driver-step-1',
            title: 'Verify currently installed device driver',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Stop Windows from installing drivers for specific devices.pdf',
            content: 'Ensure that the desired working device driver is currently installed and functional on your system before proceeding.\n\nDisconnect from the Internet temporarily if Windows Update is repeatedly replacing your working driver with an unstable or generic driver during testing.',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'block-driver-step-2',
            title: 'Look up the Hardware ID in Device Manager',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Stop Windows from installing drivers for specific devices.pdf',
            content: '1. Press Windows Key + X and select Device Manager (or run devmgmt.msc).\n2. Locate the target device in the component tree.\n3. Right-click the device and select Properties.\n4. Switch to the Details tab.\n5. Select "Hardware Ids" from the Property dropdown.\n6. Right-click the top value in the Value list and select Copy.',
            mediaIds: ['driver-hardware-ids'],
            tableIds: [],
          },
          {
            id: 'block-driver-step-3',
            title: 'Open Group Policy Editor to Device Installation Restrictions',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Stop Windows from installing drivers for specific devices.pdf',
            content: '1. Press Windows Key + R, type gpedit.msc, and press Enter to launch the Local Group Policy Editor.\n2. In the left navigation tree, browse to:\n   Computer Configuration > Administrative Templates > System > Device Installation > Device Installation Restrictions',
            mediaIds: ['group-policy-device-restrictions'],
            tableIds: [],
          },
          {
            id: 'block-driver-step-4',
            title: 'Configure: Prevent installation of devices matching Hardware IDs',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Stop Windows from installing drivers for specific devices.pdf',
            content: '1. In the right pane, double-click "Prevent installation of devices that match any of these device IDs".\n2. Set the policy state to "Enabled".\n3. Under Options, click the "Show..." button.\n4. Paste the copied Hardware ID into the Value column.\n5. Click OK, then click Apply and OK.',
            mediaIds: ['prevent-installation-policy', 'show-hardware-ids-dialog'],
            tableIds: [],
          },
          {
            id: 'block-driver-step-5',
            title: 'Verification: Verify driver update blocking in action',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Stop Windows from installing drivers for specific devices.pdf',
            content: '1. Reconnect your network connection.\n2. Trigger Windows Update or attempt to install an updated driver for the device.\n3. Windows will block the installation and display a policy restriction status in Device Manager and a system notification.\n4. To allow driver updates again in the future, return to the Group Policy setting and set it back to "Not Configured".',
            mediaIds: ['device-manager-blocked-status', 'windows-unable-to-install-notification'],
            tableIds: [],
          },
        ],
      };

    case 'windows-powershell-cmd':
      return {
        media: [],
        tables: [
          {
            id: 'powershell-core-commands',
            title: 'PowerShell Core Commands & Usage Examples',
            headers: ['Command', 'Description & Practical Usage'],
            rows: [
              ['get-help', 'Shows command descriptions.\nExample 1: get-help ls\nExample 2 (full help): get-help ls -full'],
              ['ls', 'List Directory – Lists all items in the specified directory.\nExample 1: ls C:\\\nExample 2 (hidden items): ls C:\\("Program Files") -force'],
              ['pwd', 'Print Working Directory – Displays current working directory path.'],
              ['cd', 'Change Directory – Navigates file system.\nExample 1: cd C:\\Users\\Archim\\Desktop\nExample 2 (parent): cd ..\nTip: Press TAB to auto-complete paths.'],
              ['net user <username> <password> /add /logonpasswordchg:yes', 'Creates a new local user account requiring a password change upon first login.\nExample: net user Archim 123456 /add /logonpasswordchg:yes'],
              ['net user <username> /del', 'Deletes the specified local user account.'],
            ],
          },
          {
            id: 'powershell-parameters',
            title: 'Common PowerShell Parameters',
            headers: ['Parameter', 'Description'],
            rows: [
              ['-force', 'Forces the action, revealing hidden/system files or overriding safety checks.'],
              ['-full', 'Displays complete cmdlet help including parameters, inputs, outputs, and examples.'],
            ],
          },
        ],
        guidedSteps: [
          {
            id: 'ps-cmd-step-1',
            title: 'Core PowerShell Navigation & User Management Cmdlets',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Powershell and CMD Commands.docx',
            content: 'Commonly used PowerShell navigation, inspection, and local account administration commands.\n\nUse get-help with any cmdlet to view its documentation and examples.',
            mediaIds: [],
            tableIds: ['powershell-core-commands'],
          },
          {
            id: 'ps-cmd-step-2',
            title: 'Standard Parameters',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Powershell and CMD Commands.docx',
            content: 'Key parameters used across file management and administration cmdlets.',
            mediaIds: [],
            tableIds: ['powershell-parameters'],
          },
        ],
      };

    case 'windows-troubleshooting-compendium':
      return {
        media: [
          {
            id: 'chromium-blank-screen',
            filename: '01-chromium-blank-white-screen.png',
            src: '/assets/guides/windows-troubleshooting-compendium/01-chromium-blank-white-screen.png',
            alt: 'Chromium browser displaying an empty white window on startup',
            caption: 'Figure 1: Chromium, Chrome, or Brave launch failure resulting in a blank white window due to GPU hardware acceleration incompatibility.',
          },
          {
            id: 'shortcut-disable-gpu',
            filename: '02-shortcut-disable-gpu-target.png',
            src: '/assets/guides/windows-troubleshooting-compendium/02-shortcut-disable-gpu-target.png',
            alt: 'Browser shortcut Properties dialog Target field with --disable-gpu parameter appended',
            caption: 'Figure 2: In the shortcut Properties dialog on the Shortcut tab, append --disable-gpu at the end of the Target field.',
          },
        ],
        tables: [
          {
            id: 'public-dns-providers',
            title: 'High-Performance Public DNS Providers',
            headers: ['Provider', 'IPv4 Primary', 'IPv4 Secondary', 'IPv6 Primary', 'IPv6 Secondary'],
            rows: [
              ['Cisco OpenDNS', '208.67.222.222', '208.67.220.220', '2620:119:35::35', '2620:119:53::53'],
              ['Cloudflare DNS', '1.1.1.1', '1.0.0.1', '2606:4700:4700::1112', '2606:4700:4700::1002'],
              ['Google Public DNS', '8.8.8.8', '8.8.4.4', '2001:4860:4860::8888', '2001:4860:4860::8844'],
              ['AdGuard DNS', '94.140.14.15', '94.140.15.16', '2a10:50c0::bad1:ff', '2a10:50c0::bad2:ff'],
              ['CleanBrowsing', '185.228.168.168', '185.228.169.168', '2a0d:2a00:1::', '2a0d:2a00:2::'],
            ],
          },
          {
            id: 'windows-admin-tasks',
            title: 'Windows Administrative & Power Management Commands',
            headers: ['Task Description', 'Command Syntax'],
            rows: [
              ['List power schemes', 'powercfg -list'],
              ['Enable hibernate', 'powercfg /hibernate on'],
              ['Unlock Ultimate Performance plan', 'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61'],
              ['Enable built-in Administrator', 'net user administrator /active:yes'],
              ['Disable built-in Administrator', 'net user administrator /active:no'],
              ['Scan and repair system files', 'sfc /scannow'],
              ['DISM restore component store', 'Dism /Online /Cleanup-Image /RestoreHealth'],
              ['Clean orphaned DISM mountpoints', 'Dism /Cleanup-Mountpoints'],
              ['Enable Wi-Fi interface', 'netsh interface set interface name="Wi-Fi" admin=enabled'],
              ['Disable Wi-Fi interface', 'netsh interface set interface name="Wi-Fi" admin=disabled'],
              ['Disable HPET dynamic tick', 'bcdedit /set disabledynamictick yes'],
              ['Re-enable platform clock', 'bcdedit /set useplatformclock true'],
              ['Stop telemetry service', 'Stop-Service diagtrack'],
              ['Enable Hyper-V feature', 'DISM /Online /Enable-Feature /FeatureName:Microsoft-Hyper-V -All'],
              ['Disable Hyper-V feature', 'DISM /Online /Disable-Feature /FeatureName:Microsoft-Hyper-V-All'],
              ['Unhide virus-hidden USB files', 'ATTRIB -h -r -s /s /d X:\\*.*'],
              ['Upgrade Windows 10 IoT LTSC 21H2 to 22H2', 'Dism /online /add-package /packagepath:microsoft-windows-22h2enablement-package~31bf3856ad364e35~amd64~~10.0.19041.1799.mum'],
              ['Roll back IoT LTSC 22H2 to 21H2', 'Dism /online /remove-package /packagename:microsoft-windows-22h2enablement-package~31bf3856ad364e35~amd64~~10.0.19041.1799'],
            ],
          },
        ],
        guidedSteps: [
          {
            id: 'troubleshoot-step-1',
            title: 'Fix Chromium / Brave Blank White Screen on Launch',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Troubleshooting and Tweak Guides for Windows.docx',
            content: 'Symptom: When launching Chromium, Chrome, or Brave, the application opens as a completely blank white window.\n\nCause: GPU hardware acceleration conflict with outdated graphics drivers or integrated GPU switching.\n\nResolution:\n1. Right-click the browser desktop shortcut and select Properties.\n2. In the Shortcut tab, find the Target field.\n3. Add a space and append --disable-gpu at the end of the line (outside the closing quotation marks).\n4. Click Apply and OK, then launch the browser.',
            mediaIds: ['chromium-blank-screen', 'shortcut-disable-gpu'],
            tableIds: [],
          },
          {
            id: 'troubleshoot-step-2',
            title: 'Public DNS Configuration Benchmark',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Troubleshooting and Tweak Guides for Windows.docx',
            content: 'Configure secure, privacy-preserving, and low-latency DNS servers in your Windows network adapter settings or router configuration.',
            mediaIds: [],
            tableIds: ['public-dns-providers'],
          },
          {
            id: 'troubleshoot-step-3',
            title: 'Essential Windows Maintenance and Power Commands',
            sourcePath: 'Setups/OS Environment/Windows/Troubleshooting and Tweak Guides for Windows/Troubleshooting and Tweak Guides for Windows.docx',
            content: 'High-utility commands for power scheme management, system file repair, network troubleshooting, and component store servicing.',
            mediaIds: [],
            tableIds: ['windows-admin-tasks'],
          },
        ],
      };

    case 'n8n-local-docker-compose':
      return {
        media: [
          {
            id: 'n8n-overview',
            filename: '01-n8n-stack-overview.png',
            src: '/assets/guides/n8n-local-docker-compose/01-n8n-stack-overview.png',
            alt: 'Local automation stack architecture diagram showing n8n, PostgreSQL 18, SearXNG, and AI runner sandbox',
            caption: 'Figure 1: High-level local automation topology: n8n connects to PostgreSQL 18, SearXNG, and the isolated runner.',
          },
          {
            id: 'n8n-checks',
            filename: '02-architecture-and-checks.png',
            src: '/assets/guides/n8n-local-docker-compose/02-architecture-and-checks.png',
            alt: 'Windows PowerShell and Ubuntu WSL 2 prerequisite checks',
            caption: 'Figure 2: Host verification checks for WSL 2 status and Docker Desktop integration.',
          },
          {
            id: 'n8n-sandbox-security',
            filename: '03-sandbox-runner-security.png',
            src: '/assets/guides/n8n-local-docker-compose/03-sandbox-runner-security.png',
            alt: 'Security boundary callout for privileged Docker-in-Docker runner',
            caption: 'Figure 3: Security boundary: The local runner uses privileged mode for Docker-in-Docker execution.',
          },
          {
            id: 'n8n-container-topology',
            filename: '04-container-topology.png',
            src: '/assets/guides/n8n-local-docker-compose/04-container-topology.png',
            alt: 'Docker container network and volume topology',
            caption: 'Figure 4: Container network mapping and data volume persistence paths.',
          },
          {
            id: 'n8n-runner-arch',
            filename: '05-runner-architecture.png',
            src: '/assets/guides/n8n-local-docker-compose/05-runner-architecture.png',
            alt: 'Task runner architecture and internal workflow execution flow',
            caption: 'Figure 5: Task runner queue and sandbox execution lifecycle.',
          },
          {
            id: 'n8n-port-conflict',
            filename: '06-port-configuration.png',
            src: '/assets/guides/n8n-local-docker-compose/06-port-configuration.png',
            alt: 'Port conflict resolution diagram',
            caption: 'Figure 6: Dual-port binding options for existing local web service instances.',
          },
        ],
        tables: [
          {
            id: 'n8n-quick-reference',
            title: '01 Deployment at a Glance',
            headers: ['Need', 'Command / Destination'],
            rows: [
              ['Open n8n UI in browser', 'http://localhost:5678'],
              ['Start all services (background)', 'cd ~/n8n && docker compose up -d'],
              ['Stop all services', 'cd ~/n8n && docker compose down'],
              ['View live n8n logs', 'docker compose logs -f n8n'],
              ['Check container health', 'docker compose ps'],
            ],
          },
          {
            id: 'n8n-port-options',
            title: '07 Safe Port Conflict Resolution Options',
            headers: ['Safe Option', 'How It Works', 'Trade-off'],
            rows: [
              ['Use a second host port', 'Override 127.0.0.1:5679:5678 in Compose', 'Two separate instances run concurrently at ports 5678 and 5679'],
              ['Safely retire old instance', 'Back up and verify data, then stop old container', 'One instance at standard port 5678; old instance must be stopped'],
            ],
          },
        ],
        guidedSteps: [
          {
            id: 'n8n-step-1',
            title: '01 Deployment at a Glance',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'Quick-reference commands for daily use after reboots or restarts.',
            mediaIds: ['n8n-overview'],
            tableIds: ['n8n-quick-reference'],
          },
          {
            id: 'n8n-step-2',
            title: '02 Prerequisites and Host Checks',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'In Windows PowerShell, verify WSL 2 and Docker integration:\n\nwsl --status\nwsl --list --verbose\ndocker version\ndocker compose version\n\nIn Ubuntu WSL 2:\nwsl.exe -d Ubuntu -e sh -c "docker version && docker compose version"',
            mediaIds: ['n8n-checks'],
            tableIds: [],
          },
          {
            id: 'n8n-step-3',
            title: '03 Create Project Directory and Layout',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'In Ubuntu WSL 2, create the dedicated project directory:\n\nmkdir -p ~/n8n && cd ~/n8n\npwd\nls -la',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'n8n-step-4',
            title: '04 Create .env and Generate Secrets',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'Generate strong encryption keys and passwords:\n\nPOSTGRES_PASSWORD=$(openssl rand -hex 16)\nN8N_ENCRYPTION_KEY=$(openssl rand -hex 16)\nRUNNER_AUTH_TOKEN=$(openssl rand -hex 16)\n\nStore these in ~/n8n/.env with restrictive file permissions (chmod 600 .env).',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'n8n-step-5',
            title: '05 SearXNG and Docker Compose Configuration',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'Configure searxng-settings.yml to enable JSON format output for local search agents, and deploy the docker-compose.yml definition pinning postgres:18-alpine, searxng/searxng, and docker.n8n.io/n8nio/n8n.',
            mediaIds: ['n8n-container-topology'],
            tableIds: [],
          },
          {
            id: 'n8n-step-6',
            title: '06 Security Boundary: Privileged Runner Sandbox',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'The bundled sandbox runner uses privileged mode for local testing. Never expose these services to the public Internet; bind only to 127.0.0.1.',
            mediaIds: ['n8n-sandbox-security', 'n8n-runner-arch'],
            tableIds: [],
          },
          {
            id: 'n8n-step-7',
            title: '07 Host Port Conflicts & Resolutions',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'If port 5678 is already in use by a legacy n8n container, choose one of two safe paths:',
            mediaIds: ['n8n-port-conflict'],
            tableIds: ['n8n-port-options'],
          },
          {
            id: 'n8n-step-8',
            title: '08 Routine Maintenance and Image Updates',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'cd ~/n8n\ndocker compose pull\ndocker compose up -d\ndocker image prune -f',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'n8n-step-9',
            title: '09 Backup and Recovery Routine',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'Backup database:\ndocker compose exec postgres pg_dump -U postgres n8n > ~/n8n-backup-$(date +%F).sql\n\nPreserve the ~/n8n/.env file and the Docker named volumes.',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'n8n-step-10',
            title: '10 Verification Checklist & Change Notes',
            sourcePath: 'Setups/Programming Related/n8n Local Docker Compose Reference Guide.pdf',
            content: 'Verify local access at http://localhost:5678, test workflow execution, and confirm database connectivity.',
            mediaIds: [],
            tableIds: [],
          },
        ],
      };

    case 'software-troubleshooting-configurations':
      return {
        media: [],
        tables: [],
        guidedSteps: [
          {
            id: 'soft-step-1',
            title: '1. Kivy GUI Framework Setup on Windows / Python',
            sourcePath: 'Setups/Programming Related/Software Troubleshooting and Configurations.docx',
            content: 'Ensure Python wheels and compilation prerequisites are installed before installing Kivy:\n\npython -m pip install --upgrade pip wheel setuptools\npython -m pip install docutils pygments pypiwin32 kivy_deps.sdl2 kivy_deps.glew\npython -m pip install kivy',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'soft-step-2',
            title: "2. Android Studio: Fix 'Failed to create JVM: error code -4'",
            sourcePath: 'Setups/Programming Related/Software Troubleshooting and Configurations.docx',
            content: 'Issue: Android Studio fails to start with "Failed to create JVM: error code -4".\n\nCause: The maximum heap size (-Xmx) in studio64.exe.vmoptions exceeds available contiguous virtual memory or is incompatible with the installed JDK architecture.\n\nFix:\n1. Open %APPDATA%\\Google\\AndroidStudio<version>\\studio64.exe.vmoptions in a text editor.\n2. Adjust the initial/max heap size:\n   -Xms512m\n   -Xmx1024m\n3. Save and restart Android Studio.',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'soft-step-3',
            title: '3. Android Studio & Gradle Performance Tweaks',
            sourcePath: 'Setups/Programming Related/Software Troubleshooting and Configurations.docx',
            content: 'Speed up Gradle sync and project build times:\n\nIn %USERPROFILE%\\.gradle\\gradle.properties add:\norg.gradle.daemon=true\norg.gradle.parallel=true\norg.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'soft-step-4',
            title: '4. How to Install WSL2 & Ubuntu Linux GUI (XFCE Desktop)',
            sourcePath: 'Setups/Programming Related/Software Troubleshooting and Configurations.docx',
            content: 'Set up an XFCE graphical desktop environment inside WSL2:\n\n1. In Windows PowerShell (Admin):\n   wsl --set-default-version 2\n\n2. Inside Ubuntu terminal:\n   sudo apt update && sudo apt upgrade -y\n   sudo apt install -y xfce4 xfce4-goodies tightvncserver xrdp\n\n3. Configure ~/.vnc/xstartup:\n   #!/bin/bash\n   xrdb $HOME/.Xresources\n   startxfce4 &\n\n4. Start VNC server: vncserver :1\n5. Connect via VNC Viewer to localhost:5901.',
            mediaIds: [],
            tableIds: [],
          },
          {
            id: 'soft-step-5',
            title: '5. Eclipse IDE: Incompatible JVM Fix',
            sourcePath: 'Setups/Programming Related/Software Troubleshooting and Configurations.docx',
            content: 'Issue: Eclipse displays "Incompatible JVM" on startup.\n\nResolution:\nEdit eclipse.ini in the Eclipse installation directory. Add the -vm parameter before -vmargs pointing directly to your JDK bin directory:\n\n-vm\nC:/Program Files/Java/jdk-17/bin/javaw.exe\n-vmargs',
            mediaIds: [],
            tableIds: [],
          },
        ],
      };

    case 'windows-performance-suite':
      return {
        media: [],
        tables: [
          {
            id: 'power-plan-comparison-table',
            title: 'Windows Power Plan Customization Comparison',
            headers: ['Power Setting Parameter', 'Ultimate Performance', 'Highest Performance', 'Ultra Performance'],
            rows: [
              ['Processor Performance Boost Mode', 'Aggressive (2)', 'Efficient Aggressive (3)', 'Disabled (0)'],
              ['Minimum Processor State (AC)', '100%', '100%', '100%'],
              ['Minimum Processor State (DC)', '100%', '5%', '5%'],
              ['PCIe Link State Power Management (AC)', 'Off', 'Off', 'Off'],
              ['PCIe Link State Power Management (DC)', 'Off', 'Moderate Savings', 'Maximum Savings'],
              ['Hard Disk Turn Off Timeout (AC)', 'Never (0 min)', 'Never (0 min)', 'Never (0 min)'],
              ['AHCI Link Power Management (AC)', 'Active (HIPM/DIPM Off)', 'Active', 'Active'],
              ['Wireless Adapter Power Saving (AC)', 'Maximum Performance', 'Maximum Performance', 'Maximum Performance'],
              ['USB Selective Suspend (AC)', 'Disabled', 'Disabled', 'Disabled'],
            ],
          },
        ],
        guidedSteps: [
          {
            id: 'perf-step-1',
            title: 'Power Plan Configurations Overview',
            sourcePath: 'Setups/OS Environment/Windows/Tweaks for Windows/Highest Performance.pdf',
            content: 'Comparison of customized power plan parameters exported across the Ultimate, Highest, and Ultra performance power schemes.',
            mediaIds: [],
            tableIds: ['power-plan-comparison-table'],
          },
        ],
      };

    default:
      return {
        media: [],
        tables: [],
      };
  }
}
