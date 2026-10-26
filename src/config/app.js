import { VARIANTE } from './variante';

// Dados de cada app. O ADM e o Motorista são instalados separados
// (pacotes Android diferentes), por isso cada um tem seu próprio
// "scheme" de retorno do login com Google.
export const EH_APP_MOTORISTA = VARIANTE === 'motorista';

export const APP = EH_APP_MOTORISTA
  ? { nome: 'Frota Motorista', scheme: 'frotamotorista', papel: 'motorista' }
  : { nome: 'Frota ADM', scheme: 'frotafinanceiro', papel: 'administrador' };
