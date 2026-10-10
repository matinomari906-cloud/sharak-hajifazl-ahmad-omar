$ErrorActionPreference = 'Stop'

$edge = Get-Command 'msedge.exe' -ErrorAction SilentlyContinue
$edgePath = if ($edge) { $edge.Source } else { $null }

if (-not $edgePath) {
  $candidates = @(
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\Application\msedge.exe')
  )
  $edgePath = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
}

if (-not $edgePath) {
  throw 'Microsoft Edge was not found. Install Microsoft Edge, then run this app again.'
}

$appFile = Join-Path $PSScriptRoot 'index.html'
$appUrl = ([System.Uri]::new((Resolve-Path -LiteralPath $appFile).Path)).AbsoluteUri
Start-Process -FilePath $edgePath -ArgumentList @("--app=$appUrl", '--no-first-run')
