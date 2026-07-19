@echo off
echo CaloriTrack durduruluyor...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq CaloriTrack Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq CaloriTrack Backend*" >nul 2>&1
wmic process where "commandline like '%%uvicorn%%app.main%%'" delete >nul 2>&1
wmic process where "commandline like '%%next%%dev%%'" delete >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq CaloriTrack Frontend*" >nul 2>&1
echo.
echo CaloriTrack durduruldu!
timeout /t 3
