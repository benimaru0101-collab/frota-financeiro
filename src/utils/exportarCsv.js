// Entrega o CSV ao usuário. No celular abre a folha de compartilhamento
// nativa (WhatsApp, e-mail, Drive...); na versão web/PWA baixa o arquivo.
// Sem dependência nova: usa só Share e Platform do React Native.
import { Platform, Share } from 'react-native';

export async function exportarCsv(nomeArquivo, conteudo) {
  if (Platform.OS === 'web') {
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: nomeArquivo, message: conteudo });
}

export function nomeArquivoRelatorio(periodo, hoje = new Date()) {
  const dia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  return `relatorio-${periodo}-${dia}.csv`;
}
