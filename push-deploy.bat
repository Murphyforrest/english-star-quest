@echo off
chcp 65001 >nul
title English Star Quest - Push to Cloudflare

echo.
echo ====================================================
echo   English Star Quest - Push Phase 3 to Cloudflare
echo ====================================================
echo.
echo Pushing 6 commits + 6 tags to GitHub:
echo   v25.1-tracked-audio-cancel-all
echo   v26-pet-pool-refresh
echo   v27-parent-ui-fix
echo   v28-galaxy-egg
echo   v29-multi-egg-collection
echo   v30-star-economy
echo.
echo If this is your first push, a browser window will
echo open for GitHub login. Click "Sign in with your
echo browser" then Authorize.
echo.
echo ====================================================
echo.

cd /d "%~dp0"

git push origin main --tags

echo.
echo ====================================================
if errorlevel 1 (
    echo   FAILED. Check error message above.
) else (
    echo   SUCCESS! Cloudflare Pages will auto-deploy
    echo   within 1-2 minutes. Then reload the PWA on
    echo   iPad to see Phase 3 features.
)
echo ====================================================
echo.
pause
