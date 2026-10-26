# Publica FrotaMotorista.apk e FrotaADM.apk numa Release do GitHub.
# Usa o login do GitHub ja salvo no Windows (Git Credential Manager).
# O token nunca e mostrado nem gravado.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repo = 'benimaru0101-collab/frota-financeiro'
$tag  = 'v1.0-teste'
$pasta = Join-Path $PSScriptRoot 'apk'
$apks = @('FrotaMotorista.apk', 'FrotaADM.apk')

foreach ($a in $apks) { if (-not (Test-Path (Join-Path $pasta $a))) { throw "Nao achei $a em $pasta" } }

$cred = "protocol=https`nhost=github.com`n`n" | git credential fill 2>$null
$token = (($cred | Where-Object { $_ -like 'password=*' }) -replace '^password=', '')
if (-not $token) { throw 'Nao encontrei login do GitHub salvo neste PC. Faca um git push uma vez e tente de novo.' }
$h = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json'; 'User-Agent' = 'publicar-apks' }

$info = Invoke-RestMethod -Headers $h -Uri "https://api.github.com/repos/$repo"
Write-Output ("Repositorio privado: " + $info.private)

try {
  $rel = Invoke-RestMethod -Headers $h -Uri "https://api.github.com/repos/$repo/releases/tags/$tag"
  Write-Output "Release $tag ja existia, atualizando os arquivos."
} catch {
  $corpo = @{
    tag_name = $tag; target_commitish = $info.default_branch; prerelease = $true
    name = 'Frota Motorista e Frota ADM - teste'
    body = "Apps Android para teste.`n`n- **FrotaMotorista.apk**: app do motorista (viagens, iniciar/finalizar com foto, abastecer, Google Maps e Agenda). Tem 'Ver demonstracao (sem conta)'.`n- **FrotaADM.apk**: app do administrador.`n`nInstalar: baixe o .apk no celular Android, toque nele, permita 'instalar desta fonte' e toque em Instalar. Os dois podem ficar instalados juntos."
  } | ConvertTo-Json
  $rel = Invoke-RestMethod -Method Post -Headers $h -Uri "https://api.github.com/repos/$repo/releases" -Body ([Text.Encoding]::UTF8.GetBytes($corpo)) -ContentType 'application/json'
  Write-Output "Release $tag criada."
}

foreach ($a in $apks) {
  $velho = $rel.assets | Where-Object { $_.name -eq $a }
  if ($velho) { Invoke-RestMethod -Method Delete -Headers $h -Uri "https://api.github.com/repos/$repo/releases/assets/$($velho.id)" | Out-Null }
  Write-Output "Enviando $a ..."
  $up = Invoke-RestMethod -Method Post -Headers $h -Uri "https://uploads.github.com/repos/$repo/releases/$($rel.id)/assets?name=$a" -InFile (Join-Path $pasta $a) -ContentType 'application/vnd.android.package-archive' -TimeoutSec 900
  Write-Output ("OK: " + $up.browser_download_url)
}
Write-Output ("LINK_RELEASE: " + $rel.html_url)
