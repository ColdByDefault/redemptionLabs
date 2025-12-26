@echo off
echo ========================================
echo   Redemption Plugin Rebuild Script
echo ========================================
echo.

:: Check if .rebuild-pending exists
if exist ".rebuild-pending" (
    echo Rebuild pending flag detected.
) else (
    echo No rebuild pending. Running anyway...
)

echo.
echo Step 1: Building the application...
echo ----------------------------------------
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Step 2: Cleaning up rebuild flag...
echo ----------------------------------------
if exist ".rebuild-pending" del ".rebuild-pending"

echo.
echo ========================================
echo   Build completed successfully!
echo ========================================
echo.
echo Please restart your development server:
echo   npm run dev
echo.
echo Or if running in production:
echo   npm run start
echo.
pause
