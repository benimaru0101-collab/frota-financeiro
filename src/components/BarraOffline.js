import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useStatusOffline } from '../lib/offline';
import { colors, spacing, radius } from '../theme/colors';

// Aviso flutuante de conexão: aparece só quando o app está sem internet
// ou tem lançamentos esperando para ser enviados. Tocar força uma
// tentativa de sincronização.
export default function BarraOffline() {
  const { online, pendentes, sincronizando, sincronizar } = useStatusOffline();
  if (online && pendentes === 0 && !sincronizando) return null;

  let texto;
  if (sincronizando) texto = 'Enviando alterações…';
  else if (!online && pendentes > 0) texto = `Sem internet · ${pendentes} ${pendentes === 1 ? 'alteração aguardando' : 'alterações aguardando'} envio`;
  else if (!online) texto = 'Sem internet · mostrando dados salvos no aparelho';
  else texto = `${pendentes} ${pendentes === 1 ? 'alteração aguardando' : 'alterações aguardando'} envio`;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={sincronizar}
        style={[styles.pill, { backgroundColor: online ? colors.info : '#5A4A00' }]}
      >
        {sincronizando ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.icone}>{online ? '⏳' : '📴'}</Text>}
        <Text style={styles.texto}>{texto}</Text>
        {!sincronizando && <Text style={styles.acao}>Tentar agora</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 92, alignItems: 'center', paddingHorizontal: spacing.md },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: radius.pill,
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  icone: { fontSize: 14 },
  texto: { color: '#fff', fontSize: 12, fontWeight: '600', flexShrink: 1 },
  acao: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});
