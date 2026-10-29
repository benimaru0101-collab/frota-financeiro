@echo off
title Publicando o site (politica de privacidade) no GitHub
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publicar-site.ps1" > "%~dp0publicar-site-log.txt" 2>&1
type "%~dp0publicar-site-log.txt"
echo === FIM ===
