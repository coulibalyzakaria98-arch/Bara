# ================================================================
# Script de Génération de Clés Secrètes - BaraCorrespondance AI
# ================================================================
# Usage: .\generate_secrets.ps1
#
# Génère toutes les clés nécessaires pour le déploiement sur Render
# ================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Génération de Clés Secrètes - BaraCorrespondance AI" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour générer une clé aléatoire
function Generate-SecretKey {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes) -replace '\+', '-' -replace '/', '_' -replace '=', ''
}

Write-Host "🔐 Génération des clés..." -ForegroundColor Yellow
Write-Host ""

# Générer SECRET_KEY
$secretKey = Generate-SecretKey
Write-Host "✅ SECRET_KEY générée" -ForegroundColor Green

# Générer JWT_SECRET_KEY
$jwtSecretKey = Generate-SecretKey
Write-Host "✅ JWT_SECRET_KEY générée" -ForegroundColor Green

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Clés à copier dans Render Dashboard" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "SECRET_KEY" -ForegroundColor Yellow -NoNewline
Write-Host " = " -NoNewline
Write-Host $secretKey -ForegroundColor White

Write-Host "JWT_SECRET_KEY" -ForegroundColor Yellow -NoNewline
Write-Host " = " -NoNewline
Write-Host $jwtSecretKey -ForegroundColor White

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Générer les clés VAPID si py-vapid est installé
Write-Host "🔔 Génération des clés VAPID (Web Push)..." -ForegroundColor Yellow
Write-Host ""

$vapidInstalled = $false
try {
    python -c "import py_vapid" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $vapidInstalled = $true
    }
} catch {
    $vapidInstalled = $false
}

if ($vapidInstalled) {
    Write-Host "Exécution de generate_vapid_keys.py..." -ForegroundColor Gray
    python backend/generate_vapid_keys.py
} else {
    Write-Host "⚠️  py-vapid n'est pas installé (optionnel)" -ForegroundColor DarkYellow
    Write-Host ""
    Write-Host "Pour générer les clés VAPID (notifications push):" -ForegroundColor Gray
    Write-Host "  1. cd backend" -ForegroundColor Gray
    Write-Host "  2. pip install py-vapid pywebpush" -ForegroundColor Gray
    Write-Host "  3. python generate_vapid_keys.py" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Prochaines étapes" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Copier les clés ci-dessus dans Render Dashboard:" -ForegroundColor White
Write-Host "   Backend Service → Environment Variables" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Ajouter les autres variables requises:" -ForegroundColor White
Write-Host "   - GEMINI_API_KEY (obligatoire)" -ForegroundColor Gray
Write-Host "   - DATABASE_URL (auto-généré par PostgreSQL)" -ForegroundColor Gray
Write-Host "   - CORS_ORIGINS (URL frontend)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Consulter le guide complet:" -ForegroundColor White
Write-Host "   DEPLOYMENT_RENDER.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Offrir de copier dans le presse-papiers (Windows uniquement)
$response = Read-Host "Copier SECRET_KEY dans le presse-papiers? (o/n)"
if ($response -eq 'o' -or $response -eq 'O' -or $response -eq 'y' -or $response -eq 'Y') {
    $secretKey | Set-Clipboard
    Write-Host "✅ SECRET_KEY copiée dans le presse-papiers!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Bonne chance avec votre déploiement!" -ForegroundColor Green
Write-Host ""
