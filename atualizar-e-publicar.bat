@echo off
title Gerando os 2 APKs e publicando no GitHub (deixe aberta)
cd /d "%~dp0"
echo === ATUALIZAR E PUBLICAR %DATE% %TIME% === > "%~dp0atualizar-e-publicar-log.txt"
call "%~dp0gerar-apk-adm.bat" < nul
call "%~dp0gerar-apk-motorista.bat" < nul
findstr /c:"APK_OK" "%~dp0gerar-apk-adm-log.txt" >nul || (echo ERRO_BUILD_ADM >> "%~dp0atualizar-e-publicar-log.txt" & goto fim)
findstr /c:"APK_OK" "%~dp0gerar-apk-motorista-log.txt" >nul || (echo ERRO_BUILD_MOTORISTA >> "%~dp0atualizar-e-publicar-log.txt" & goto fim)
echo Publicando no GitHub...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publicar-apks-github.ps1" > "%~dp0publicar-apks-github-log.txt" 2>&1
type "%~dp0publicar-apks-github-log.txt"
echo PUBLICADO >> "%~dp0atualizar-e-publicar-log.txt"
:fim
echo === FIM === >> "%~dp0atualizar-e-publicar-log.txt"
echo Pronto.
