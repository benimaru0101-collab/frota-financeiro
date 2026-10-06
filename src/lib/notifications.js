import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { documentosVencendo } from '../utils/vencimentos';

// Notificações LOCAIS (agendadas no próprio aparelho, sem precisar de
// servidor/push) — funcionam normalmente no Expo Go. Configuração de
// como a notificação se comporta com o app aberto:
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function solicitarPermissaoNotificacoes() {
  if (Platform.OS === 'web') return false; // sem notificação local agendada no navegador
  const { status: atual } = await Notifications.getPermissionsAsync();
  if (atual === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelarNotificacoesVencimento() {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (erro) {
    console.warn('Não foi possível cancelar notificações:', erro?.message);
  }
}

function segundosAte(data) {
  return Math.max(Math.round((data.getTime() - Date.now()) / 1000), 1);
}

// Cancela tudo que estava agendado e reagenda um aviso local pra cada
// documento vencido ou vencendo nos próximos 30 dias.
//
// Documentos que já estão dentro da janela "de verdade" de aviso (7
// dias ou menos, ou já vencidos) disparam em poucos segundos — assim
// dá pra demonstrar a notificação funcionando na hora, sem precisar
// esperar dias. Documentos mais distantes (8 a 30 dias) agendam um
// aviso real para 7 dias antes do vencimento, às 9h.
export async function reagendarNotificacoesVencimento(documentos) {
  await cancelarNotificacoesVencimento();

  const permitido = await solicitarPermissaoNotificacoes();
  if (!permitido) return;

  const relevantes = documentosVencendo(documentos, 30);
  let atrasoDemo = 5;

  for (const doc of relevantes) {
    const { diasRestantes } = doc;
    const jaEstaPerto = diasRestantes <= 7;

    let trigger;
    if (jaEstaPerto) {
      trigger = { seconds: atrasoDemo };
      atrasoDemo += 5;
    } else {
      const disparoReal = new Date();
      disparoReal.setDate(disparoReal.getDate() + (diasRestantes - 7));
      disparoReal.setHours(9, 0, 0, 0);
      trigger = { seconds: segundosAte(disparoReal) };
    }

    const titulo =
      diasRestantes < 0
        ? 'Documento vencido'
        : diasRestantes === 0
        ? 'Documento vence hoje'
        : `Documento vence em ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'}`;

    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: titulo, body: `${doc.tipo} — ${doc.placa}` },
        trigger,
      });
    } catch (erro) {
      console.warn('Não foi possível agendar notificação:', erro?.message);
    }
  }
}
