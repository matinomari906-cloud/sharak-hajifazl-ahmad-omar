$ErrorActionPreference = 'Stop'

$launcher = Join-Path $PSScriptRoot 'Start-MatinPocket.ps1'
if (-not (Test-Path -LiteralPath $launcher)) {
  throw "The app launcher was not found: $launcher"
}

$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'Matin Pocket.lnk'
$powershell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $powershell
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$launcher`""
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Description = 'Open your personal Matin Pocket organizer'
$shortcut.Save()

Write-Host "Desktop shortcut created: $shortcutPath"
