# Publica a pasta site-publico (inicio, privacidade, termos) no GitHub Pages,
# na branch gh-pages (nao mexe na main). Usa o login do GitHub ja salvo no Windows.
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repo = 'benimaru0101-collab/frota-financeiro'
$raiz = $PSScriptRoot
$nome  = (git -C $raiz log -1 --format=%an)
$email = (git -C $raiz log -1 --format=%ae)
$tmp = Join-Path $env:TEMP ("site-frota-" + [guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $tmp | Out-Null
Copy-Item (Join-Path $raiz 'site-publico\*') $tmp
New-Item -ItemType File -Path (Join-Path $tmp '.nojekyll') | Out-Null
Push-Location $tmp
git init -q
git checkout -q -b gh-pages
$ErrorActionPreference = 'Continue'
git add -A 2>$null
$ErrorActionPreference = 'Stop'
git -c "user.name=$nome" -c "user.email=$email" commit -q -m "Site publico: inicio, politica de privacidade e termos de uso"
$ErrorActionPreference = 'Continue'
$saida = git push --force "https://github.com/$repo.git" gh-pages 2>&1 | ForEach-Object { "$_" }
$codigo = $LASTEXITCODE
$ErrorActionPreference = 'Stop'
$saida | Where-Object { $_ -notmatch 'warning: in the working copy' }
if ($codigo -ne 0) { throw "git push falhou (codigo $codigo)" }
Pop-Location
Write-Output 'Branch gh-pages enviada.'

$cred = "protocol=https`nhost=github.com`n`n" | git credential fill 2>$null
$token = (($cred | Where-Object { $_ -like 'password=*' }) -replace '^password=', '')
$h = @{ Authorization = "Bearer $token"; Accept = 'application/vnd.github+json'; 'User-Agent' = 'publicar-site' }
try {
  $corpo = '{"source":{"branch":"gh-pages","path":"/"}}'
  Invoke-RestMethod -Method Post -Headers $h -Uri "https://api.github.com/repos/$repo/pages" -Body $corpo -ContentType 'application/json' | Out-Null
  Write-Output 'GitHub Pages ativado.'
} catch { Write-Output ('Pages: ' + $_.Exception.Message + ' (se ja estava ativo, tudo certo)') }
$p = Invoke-RestMethod -Headers $h -Uri "https://api.github.com/repos/$repo/pages"
Write-Output ('SITE: ' + $p.html_url + ' status=' + $p.status)
