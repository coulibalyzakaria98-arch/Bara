# Script PowerShell pour lancer le serveur et le test
Set-Location "c:\Users\ZAKSOFT\Desktop\Bara\backend"

# Démarrer le serveur en background
$python = "C:/Users/ZAKSOFT/Desktop/Bara/.venv/Scripts/python.exe"

# Start server
$job = Start-Job -ScriptBlock {
    Set-Location "c:\Users\ZAKSOFT\Desktop\Bara\backend"
    & "C:/Users/ZAKSOFT/Desktop/Bara/.venv/Scripts/python.exe" -u run.py 2>&1
}

# Attendre que le serveur soit prêt
Start-Sleep -Seconds 8

# Run test
Write-Host "[TEST] Running analysis test..."
& $python -u test_analysis.py 2>&1

# Clean up
Stop-Job -Job $job -ErrorAction SilentlyContinue
Remove-Job -Job $job -ErrorAction SilentlyContinue
