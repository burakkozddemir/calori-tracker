@echo off
title CaloriTrack
echo ========================================
echo    CaloriTrack baslatiliyor...
echo ========================================

cd /d "%~dp0"

echo [1/2] Backend baslatiliyor...
start /MIN "" cmd /c "py -3.13 -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 >nul

echo [2/2] Frontend baslatiliyor...
start /MIN "" cmd /c "npx next dev --port 3000"

timeout /t 3 >nul

echo.
echo ========================================
echo    CaloriTrack baslatildi!
echo    Tarayicinda ac: http://localhost:3000
echo    Phone icin: http://192.168.1.101:3000
echo ========================================
echo.
echo Kapatmak icin calori-stop.bat calistirin
echo veya bu pencereyi kapatabilirsiniz.
echo.
timeout /t 5
