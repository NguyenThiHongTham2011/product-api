param([switch]$Watch)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectRoot
$compose = Join-Path $projectRoot 'docker-compose-prod.yaml'
if (!(Test-Path '.env.docker')) { throw 'Can tao .env.docker tu .env.docker.example truoc.' }
function Invoke-Docker {
    param([string[]]$DockerArgs)
    & docker @DockerArgs
    if ($LASTEXITCODE -ne 0) { throw "Docker failed: $DockerArgs" }
}
do {
    try {
        Invoke-Docker -DockerArgs @('info','--format','{{.ServerVersion}}')
        Invoke-Docker -DockerArgs @('volume','create','nammongodb_data')
        Invoke-Docker -DockerArgs @('compose','-p','product-api','-f',$compose,'pull','product-api')
        Invoke-Docker -DockerArgs @('compose','-p','product-api','-f',$compose,'up','-d','--no-build','--wait','--wait-timeout','180')
        $health = Invoke-RestMethod 'http://127.0.0.1:3000/health' -TimeoutSec 10
        if ($health.status -ne 'healthy' -or $health.database -ne 'connected') { throw 'Healthcheck failed' }
        Write-Host "$(Get-Date -Format s) Deployment healthy"
    } catch {
        if (!$Watch) { throw }
        Write-Warning $_
    }
    if ($Watch) { Start-Sleep -Seconds 300 }
} while ($Watch)
