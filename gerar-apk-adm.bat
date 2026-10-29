@echo off
title Gerando APK - Frota ADM (deixe esta janela aberta)
cd /d "%~dp0"
set "LOG=%~dp0gerar-apk-adm-log.txt"
set CI=1
if not defined JAVA_HOME if exist "C:\Program Files\Android\Android Studio\jbr" set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
if not defined ANDROID_HOME set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
echo === GERAR APK Frota ADM %DATE% %TIME% === > "%LOG%"
echo [1/4] Configurando o app Frota ADM...
> src\config\variante.js echo // Gerado por gerar-apk-adm.bat - nao edite.
>> src\config\variante.js echo export const VARIANTE = 'adm';
if exist android\app\build\generated\assets\createBundleReleaseJsAndAssets rmdir /s /q android\app\build\generated\assets\createBundleReleaseJsAndAssets
if exist android\app\build\outputs\apk\release\app-release.apk del /q android\app\build\outputs\apk\release\app-release.apk
echo [2/4] Dependencias...
call npm install --no-audit --no-fund >> "%LOG%" 2>&1
echo [3/4] Gerando o APK (5 a 20 minutos)...
cd android
call gradlew.bat assembleRelease  >> "%LOG%" 2>&1
cd ..
echo [4/4] Copiando o APK...
if exist android\app\build\outputs\apk\release\app-release.apk ((if not exist "%~dp0apk" mkdir "%~dp0apk") & copy /y android\app\build\outputs\apk\release\app-release.apk "%~dp0apk\FrotaADM.apk" >> "%LOG%" & (if exist "%~dp0..\Claude outputs" copy /y android\app\build\outputs\apk\release\app-release.apk "%~dp0..\Claude outputs\FrotaADM.apk" >> "%LOG%") & echo APK_OK >> "%LOG%" & echo PRONTO! APK gerado em apk\FrotaADM.apk) else (echo APK_NAO_GERADO >> "%LOG%" & echo DEU ERRO - veja o arquivo de log)
> src\config\variante.js echo // Gerado por gerar-apk-adm.bat - nao edite.
>> src\config\variante.js echo export const VARIANTE = 'adm';
echo === FIM === >> "%LOG%"
pause
