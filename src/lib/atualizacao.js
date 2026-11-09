import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import Constants from 'expo-constants';
import { EH_APP_MOTORISTA } from '../config/app';

// Atualização do app sem loja: a cada publicação, o script
// publicar-apks-github.ps1 envia junto com os APKs um arquivo versao.json
// para a Release do GitHub. O app compara a versão dele com a de lá e,
// se houver uma mais nova, mostra o botão "Atualizar", que baixa o APK novo.
const URL_VERSAO =
  'https://github.com/benimaru0101-collab/frota-financeiro/releases/download/v1.0-teste/versao.json';

export const VERSAO_ATUAL = Constants.expoConfig?.version ?? '0.0.0';

// "1.10.0" > "1.9.2"
export function versaoMaisNova(remota, local) {
  const a = String(remota).split('.').map((n) => parseInt(n, 10) || 0);
  const b = String(local).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  }
  return false;
}

export async function buscarAtualizacao() {
  const resposta = await fetch(`${URL_VERSAO}?t=${Date.now()}`, { cache: 'no-store' });
  if (!resposta.ok) return null;
  const info = await resposta.json();
  if (!info?.versao || !versaoMaisNova(info.versao, VERSAO_ATUAL)) return null;
  return {
    versao: info.versao,
    notas: info.notas ?? '',
    url: EH_APP_MOTORISTA ? info.motorista : info.adm,
  };
}

export function abrirDownload(url) {
  if (url) Linking.openURL(url);
}

// Hook usado pelas telas: verifica uma vez ao abrir; sem internet, não mostra nada.
export function useAtualizacao() {
  const [novaVersao, setNovaVersao] = useState(null);
  useEffect(() => {
    let ativo = true;
    buscarAtualizacao()
      .then((r) => ativo && setNovaVersao(r))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);
  return novaVersao;
}
