$ErrorActionPreference = 'Stop'
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 22+ is required.' }
$env:GPIO_ENABLED = if ($env:GPIO_ENABLED) { $env:GPIO_ENABLED } else { 'false' }
$env:HOST = if ($env:HOST) { $env:HOST } else { '0.0.0.0' }
$env:PORT = if ($env:PORT) { $env:PORT } else { '8000' }
Set-Location $projectRoot
node (Join-Path $projectRoot 'backend/server.mjs')
