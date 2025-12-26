@echo off
echo ========================================
echo   Redemption Dev Server with Auto-Rebuild
echo ========================================
echo.

:loop
:: Check if rebuild is pending
if exist ".rebuild-pending" (
    echo.
    echo [NOTICE] Rebuild pending - running build first...
    echo.
    call npm run build
    if exist ".rebuild-pending" del ".rebuild-pending"
)

:: Start dev server
echo Starting development server...
echo Press Ctrl+C to stop, then type 'Y' to exit or 'N' to check for rebuilds.
echo.
npm run dev

:: If server stopped, ask to restart
echo.
set /p restart="Server stopped. Check for rebuilds and restart? (Y/N): "
if /i "%restart%"=="Y" goto loop

echo Goodbye!
