#!/usr/bin/env powershell
<#
================================================================
BaraCorrespondance AI - Development Startup Script
================================================================
Lance backend (Flask) + frontend (Vite) dans deux fenêtres PowerShell.

Usage:
    . scripts/start-dev.ps1
    ou
    powershell -ExecutionPolicy Bypass -File scripts/start-dev.ps1
================================================================
#>

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "BaraCorrespondance AI - Dev Server Launcher" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Vérifier que le répertoire racine existe
if (-not (Test-Path $projectRoot)) {
    Write-Host "❌ Répertoire racine non trouvé: $projectRoot" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Répertoire racine: $projectRoot" -ForegroundColor Green
Write-Host ""

# Vérifier que venv backend existe
$venvPath = Join-Path $projectRoot "backend\.venv\Scripts\Activate.ps1"
if (-not (Test-Path $venvPath)) {
    Write-Host "❌ venv backend introuvable. Créez-le d'abord:" -ForegroundColor Red
    Write-Host "   cd backend"
    Write-Host "   python -m venv .venv"
    Write-Host "   .\.venv\Scripts\Activate.ps1"
    Write-Host "   pip install -r requirements.txt"
    exit 1
}

# Vérifier que package.json frontend existe
$packageJsonPath = Join-Path $projectRoot "frontend\package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "❌ package.json frontend introuvable: $packageJsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environnements vérifiés" -ForegroundColor Green
Write-Host ""

# Lancer le backend dans une nouvelle fenêtre PowerShell
Write-Host "🚀 Démarrage du backend (Flask)..." -ForegroundColor Cyan
$backendCmd = @"
Set-Location '$projectRoot\backend'
. .\.venv\Scripts\Activate.ps1
Write-Host '================================================' -ForegroundColor Green
Write-Host 'Backend Flask démarré' -ForegroundColor Green
Write-Host 'API: http://localhost:5000/api' -ForegroundColor Yellow
Write-Host 'Health: http://localhost:5000/api/health' -ForegroundColor Yellow
Write-Host '================================================' -ForegroundColor Green
Write-Host ''
python main.py
"@

Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCmd -WindowStyle Normal

# Attendre un peu pour laisser le backend démarrer
Start-Sleep -Seconds 2

# Lancer le frontend dans une nouvelle fenêtre PowerShell
Write-Host "🚀 Démarrage du frontend (Vite)..." -ForegroundColor Cyan
$frontendCmd = @"
Set-Location '$projectRoot\frontend'
Write-Host '================================================' -ForegroundColor Green
Write-Host 'Frontend Vite démarrage...' -ForegroundColor Green
Write-Host 'Dev server: http://localhost:5173' -ForegroundColor Yellow
Write-Host '================================================' -ForegroundColor Green
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontendCmd -WindowStyle Normal

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ Serveurs lancés dans deux fenêtres PowerShell" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000/api" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Conseil: Configurez VITE_API_BASE_URL=http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "   dans frontend/.env.local si vous déployez le frontend ailleurs." -ForegroundColor Cyan
Write-Host ""
