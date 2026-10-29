@echo off
title Gerando os 2 APKs (ADM e Motorista)
cd /d "%~dp0"
call "%~dp0gerar-apk-adm.bat" < nul
call "%~dp0gerar-apk-motorista.bat" < nul
echo.
echo Os dois APKs ficam na pasta apk (dentro do projeto).
pause
