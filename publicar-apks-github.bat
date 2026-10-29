@echo off
title Publicando os APKs no GitHub (deixe aberta)
cd /d "%~dp0"
echo Enviando os 2 APKs para o GitHub (pode levar alguns minutos)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publicar-apks-github.ps1" > "%~dp0publicar-apks-github-log.txt" 2>&1
type "%~dp0publicar-apks-github-log.txt"
echo === FIM ===
