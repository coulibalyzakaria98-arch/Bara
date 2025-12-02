@echo off
echo ============================================================
echo Installation de Google Gemini pour BaraCorrespondance AI
echo ============================================================
echo.

echo [1/3] Installation de google-generativeai...
pip install google-generativeai==0.3.2
if %errorlevel% neq 0 (
    echo ERREUR: Installation echouee
    pause
    exit /b 1
)
echo OK - google-generativeai installe
echo.

echo [2/3] Verification des autres dependances...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERREUR: Installation des dependances echouee
    pause
    exit /b 1
)
echo OK - Toutes les dependances sont installees
echo.

echo [3/3] Test de la configuration Gemini...
python test_gemini.py
if %errorlevel% neq 0 (
    echo.
    echo ERREUR: Les tests ont echoue
    echo Verifiez votre cle API dans .env
    pause
    exit /b 1
)

echo.
echo ============================================================
echo INSTALLATION TERMINEE AVEC SUCCES !
echo ============================================================
echo.
echo Vous pouvez maintenant demarrer l'application avec:
echo    python run.py
echo.
echo ============================================================
pause
