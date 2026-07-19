Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

projectDir = fso.GetParentFolderName(WScript.ScriptFullName)

WshShell.Run "cmd /c title CaloriTrack Backend && cd /d """ & projectDir & "\backend"" && py -3.13 -m uvicorn app.main:app --host 0.0.0.0 --port 8000", 0, False

WScript.Sleep 3000

WshShell.Run "cmd /c title CaloriTrack Frontend && cd /d """ & projectDir & "\frontend"" && npx next dev --port 3000", 0, False

WScript.Sleep 2000

WshShell.Popup "CaloriTrack arka planda baslatildi!" & vbCrLf & vbCrLf & "Tarayici: http://localhost:3000" & vbCrLf & "Telefon: http://192.168.1.101:3000" & vbCrLf & vbCrLf & "Durdurmak icin calori-stop.bat calistirin.", 5, "CaloriTrack", vbInformation
