@echo off
title App Frota Financeiro - versao web (deixe esta janela aberta)
cd /d "%~dp0"
echo ==============================================
echo  App Frota Financeiro - versao web para o video
echo ==============================================
echo.
echo [1/2] Instalando as dependencias da versao web (so demora na primeira vez)...
call npm install
if errorlevel 1 goto erro
echo.
echo Instalando o suporte a web (sem alterar o package.json)...
call npm install --no-save react-native-web@~0.19.10 react-dom@18.2.0 @expo/metro-runtime@~3.2.3
if errorlevel 1 goto erro
echo.
echo [2/2] Iniciando o app em http://localhost:8081
echo       NAO feche esta janela enquanto o video estiver sendo gravado.
echo.
set BROWSER=none
set CI=1
call npx expo start --web --port 8081
goto fim
:erro
echo.
echo ============================
echo DEU_ERRO - me mande um print desta janela
echo ============================
:fim
pause
