import { Linking, Alert } from 'react-native';

// Integração com o Google sem chave de API: monta links oficiais do
// Google Maps e do Google Agenda e abre no app (ou no navegador).

async function abrir(url) {
  try {
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert('Não foi possível abrir', 'Verifique se há um navegador ou o app do Google instalado.');
  }
}

export function urlRotaMaps(origem, destino) {
  const q = (t) => encodeURIComponent(String(t ?? '').trim());
  return `https://www.google.com/maps/dir/?api=1&origin=${q(origem)}&destination=${q(destino)}&travelmode=driving`;
}

// Abre a rota (origem → destino) no Google Maps.
export function abrirRotaNoMaps(origem, destino) {
  if (!origem || !destino) {
    Alert.alert('Rota indisponível', 'Esta viagem não tem origem e destino preenchidos.');
    return Promise.resolve();
  }
  return abrir(urlRotaMaps(origem, destino));
}

// "2026-10-24" -> "20261024" (e o dia seguinte, exigido pelo Google
// Agenda como fim de eventos de dia inteiro).
function dataParaAgenda(iso) {
  const [a, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  const p = (n, t = 2) => String(n).padStart(t, '0');
  const fmt = (dt) => `${dt.getUTCFullYear()}${p(dt.getUTCMonth() + 1)}${p(dt.getUTCDate())}`;
  const ini = new Date(Date.UTC(a, m - 1, d));
  const fim = new Date(Date.UTC(a, m - 1, d + 1));
  return `${fmt(ini)}/${fmt(fim)}`;
}

export function urlGoogleAgenda({ titulo, dataISO, origem, destino, detalhes }) {
  const q = (t) => encodeURIComponent(String(t ?? ''));
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${q(titulo)}` +
    `&dates=${dataParaAgenda(dataISO)}` +
    `&location=${q(origem)}` +
    `&details=${q(detalhes ?? `Rota: ${origem} → ${destino}`)}`
  );
}

// Abre o Google Agenda com a viagem já preenchida como evento.
export function adicionarViagemNaAgenda({ origem, destino, dataISO, motorista, placa }) {
  if (!dataISO) {
    Alert.alert('Sem data', 'Esta viagem não tem data para agendar.');
    return Promise.resolve();
  }
  const detalhes = [
    `Rota: ${origem} → ${destino}`,
    motorista ? `Motorista: ${motorista}` : null,
    placa ? `Veículo: ${placa}` : null,
    'Criado pelo app Financeiro e Frota Logística.',
  ].filter(Boolean).join('\n');
  return abrir(urlGoogleAgenda({ titulo: `Viagem: ${origem} → ${destino}`, dataISO, origem, destino, detalhes }));
}
