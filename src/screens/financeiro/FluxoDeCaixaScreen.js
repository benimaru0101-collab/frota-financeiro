import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Card, Title, StatPill } from '../../components/UI';
import { dashboardResumo } from '../../data/mockData';
import { colors, spacing } from '../../theme/colors';

// Gráfico simplificado com barras em View (sem dependência de lib de
// charts, para não depender de instalação extra). Pode ser trocado por
// react-native-svg-charts ou victory-native depois.
const pontos = [40, 55, 35, 60, 48, 70, 65, 80, 58];

export default function FluxoDeCaixaScreen() {
  const max = Math.max(...pontos);
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Fluxo de Caixa</Title>
        <Text style={styles.periodo}>Maio/2024</Text>
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.chart}>
          {pontos.map((valor, i) => (
            <View
              key={i}
              style={[styles.bar, { height: `${(valor / max) * 100}%` }]}
            />
          ))}
        </View>
      </Card>

      <View style={styles.statsRow}>
        <StatPill label="Saldo do Mês" value={dashboardResumo.saldoTotal} positive />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  periodo: { color: colors.textMuted, marginTop: spacing.xs },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 160, justifyContent: 'space-between' },
  bar: { width: 18, backgroundColor: colors.primary, borderRadius: 4 },
  statsRow: { marginTop: spacing.lg },
});
