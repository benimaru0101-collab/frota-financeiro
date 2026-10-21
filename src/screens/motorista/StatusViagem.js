import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../../theme/colors';
import { STATUS } from '../../lib/motorista';

const CORES = {
  [STATUS.AGENDADA]: colors.info,
  [STATUS.EM_ANDAMENTO]: colors.primary,
  [STATUS.CONCLUIDA]: colors.success,
};

export default function StatusViagem({ status }) {
  return (
    <View style={[styles.pill, { backgroundColor: CORES[status] ?? colors.surfaceAlt }]}>
      <Text style={styles.texto}>{status || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  texto: { color: colors.darkText, fontSize: 11, fontWeight: '700' },
});
