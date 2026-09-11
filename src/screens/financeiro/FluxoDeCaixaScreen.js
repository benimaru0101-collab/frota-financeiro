import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen, Card, Title, Subtitle, StatPill } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { agruparPorMes } from '../../utils/data';
import { formatValorBR } from '../../utils/money';
import { colors, spacing } from '../../theme/colors';

export default function FluxoDeCaixaScreen() {
  const { receitas, despesas, resumo } = useData();

  const meses = useMemo(() => agruparPorMes(receitas, despesas), [receitas, despesas]);
  const max = useMemo(
    () => Math.max(1, ...meses.flatMap((m) => [m.receitas, m.despesas])),
    [meses]
  );

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Fluxo de Caixa</Title>
        <Subtitle>Receitas x Despesas por mês, com base nos lançamentos cadastrados</Subtitle>
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        {meses.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chart}>
              {meses.map((mes) => (
                <View key={mes.chave} style={styles.grupoMes}>
                  <View style={styles.barrasMes}>
                    <View
                      style={[styles.bar, styles.barReceita, { height: `${(mes.receitas / max) * 100}%` }]}
                    />
                    <View
                      style={[styles.bar, styles.barDespesa, { height: `${(mes.despesas / max) * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.mesLabel}>{mes.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.vazio}>
            Cadastre receitas e despesas com data para ver o gráfico de fluxo de caixa.
          </Text>
        )}

        <View style={styles.legendaRow}>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: colors.success }]} />
            <Text style={styles.legendaTexto}>Receitas</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendaTexto}>Despesas</Text>
          </View>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <StatPill label="Total de Receitas" value={formatValorBR(meses.reduce((s, m) => s + m.receitas, 0))} positive />
        <StatPill
          label="Total de Despesas"
          value={formatValorBR(meses.reduce((s, m) => s + m.despesas, 0))}
          positive={false}
        />
      </View>
      <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
        <StatPill label="Saldo Acumulado" value={resumo.saldoTotal} positive />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 160, paddingHorizontal: spacing.xs },
  grupoMes: { alignItems: 'center', marginRight: spacing.lg },
  barrasMes: { flexDirection: 'row', alignItems: 'flex-end', height: 140 },
  bar: { width: 14, borderRadius: 4, marginHorizontal: 2 },
  barReceita: { backgroundColor: colors.success },
  barDespesa: { backgroundColor: colors.danger },
  mesLabel: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  vazio: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  legendaRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  legendaItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.sm },
  legendaCor: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.xs },
  legendaTexto: { color: colors.textMuted, fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
});
