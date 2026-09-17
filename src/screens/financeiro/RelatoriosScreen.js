import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, StatPill, FilterTabs, DonutChart, LineChart } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { agruparPorMes } from '../../utils/data';
import { formatValorBR, parseValorBR } from '../../utils/money';
import { FILTROS_PADRAO, PERIODOS, filtrarLancamentos, agruparDespesasPorCategoria, rotuloPeriodo } from '../../utils/relatorios';
import { colors, spacing } from '../../theme/colors';

export default function RelatoriosScreen({ route, navigation }) {
  const { receitas, despesas, categorias } = useData();
  const [filtros, setFiltros] = useState(FILTROS_PADRAO);

  // Volta da tela de Filtros já com os novos filtros aplicados.
  useEffect(() => {
    if (route?.params?.filtros) {
      setFiltros(route.params.filtros);
    }
  }, [route?.params?.filtros]);

  const { receitasFiltradas, despesasFiltradas } = useMemo(
    () => filtrarLancamentos({ receitas, despesas }, filtros),
    [receitas, despesas, filtros]
  );

  const totalReceitas = useMemo(
    () => receitasFiltradas.reduce((s, r) => s + parseValorBR(r.valor), 0),
    [receitasFiltradas]
  );
  const totalDespesas = useMemo(
    () => despesasFiltradas.reduce((s, d) => s + parseValorBR(d.valor), 0),
    [despesasFiltradas]
  );

  const porCategoria = useMemo(
    () => agruparDespesasPorCategoria(despesasFiltradas, categorias),
    [despesasFiltradas, categorias]
  );

  const meses = useMemo(() => agruparPorMes(receitasFiltradas, despesasFiltradas), [receitasFiltradas, despesasFiltradas]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.headerRow}>
          <View>
            <Title>Relatórios</Title>
            <Subtitle>{rotuloPeriodo(filtros.periodo)}</Subtitle>
          </View>
          <TouchableOpacity
            style={styles.filtrosBotao}
            onPress={() => navigation.navigate('FiltrosRelatorio', { filtrosAtuais: filtros, origem: 'Relatorios' })}
          >
            <Text style={styles.filtrosBotaoTexto}>⚙ Filtros</Text>
          </TouchableOpacity>
        </View>

        <FilterTabs
          options={PERIODOS.map((p) => p.label)}
          value={rotuloPeriodo(filtros.periodo)}
          onChange={(label) => setFiltros((f) => ({ ...f, periodo: PERIODOS.find((p) => p.label === label)?.valor ?? 'mes' }))}
        />

        <Text style={styles.sectionTitle}>Resumo geral</Text>
        <View style={styles.statsRow}>
          <StatPill label="Receitas" value={formatValorBR(totalReceitas)} positive />
          <StatPill label="Despesas" value={formatValorBR(totalDespesas)} positive={false} />
        </View>
        <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
          <StatPill label="Saldo do Período" value={formatValorBR(totalReceitas - totalDespesas)} positive={totalReceitas - totalDespesas >= 0} />
        </View>

        <Text style={styles.sectionTitle}>Despesas por categoria</Text>
        <Card>
          {porCategoria.length > 0 ? (
            <View style={styles.donutRow}>
              <DonutChart segments={porCategoria} />
              <View style={styles.legendaColuna}>
                {porCategoria.map((c) => (
                  <View key={c.nome} style={styles.legendaLinha}>
                    <View style={[styles.legendaBolinha, { backgroundColor: c.cor }]} />
                    <Text style={styles.legendaNome} numberOfLines={1}>{c.nome}</Text>
                    <Text style={styles.legendaPercentual}>{c.percentual.toFixed(0)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.vazio}>Nenhuma despesa no período selecionado.</Text>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Evolução mensal</Text>
        <Card>
          {meses.length > 0 ? (
            <>
              <View style={styles.legendaLinhas}>
                <View style={styles.legendaLinhaItem}>
                  <View style={[styles.legendaBolinha, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendaNome}>Receitas</Text>
                </View>
                <View style={styles.legendaLinhaItem}>
                  <View style={[styles.legendaBolinha, { backgroundColor: colors.danger }]} />
                  <Text style={styles.legendaNome}>Despesas</Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <LineChart
                    count={meses.length}
                    series={[
                      { dados: meses.map((m) => m.receitas), cor: colors.success },
                      { dados: meses.map((m) => m.despesas), cor: colors.danger },
                    ]}
                  />
                  <View style={styles.chart}>
                    {meses.map((mes) => (
                      <View key={mes.chave} style={styles.grupoMes}>
                        <Text style={styles.mesLabel}>{mes.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </>
          ) : (
            <Text style={styles.vazio}>Sem lançamentos no período selecionado.</Text>
          )}
        </Card>

        <TouchableOpacity
          style={styles.detalhadoBotao}
          onPress={() => navigation.navigate('RelatorioDetalhado', { filtros })}
        >
          <Text style={styles.detalhadoBotaoTexto}>Ver relatório detalhado</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { marginTop: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  filtrosBotao: {
    backgroundColor: colors.surfaceAlt, borderRadius: 999, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 8,
  },
  filtrosBotaoTexto: { color: colors.text, fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  donutRow: { flexDirection: 'row', alignItems: 'center' },
  legendaColuna: { flex: 1, marginLeft: spacing.lg },
  legendaLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  legendaLinhas: { flexDirection: 'row', marginBottom: spacing.md },
  legendaLinhaItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.lg },
  legendaBolinha: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  legendaNome: { color: colors.text, fontSize: 13, flex: 1 },
  legendaPercentual: { color: colors.textMuted, fontSize: 12, marginRight: spacing.sm },
  legendaValor: { color: colors.text, fontSize: 13, fontWeight: '600' },
  vazio: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  chart: { flexDirection: 'row', paddingHorizontal: spacing.xs },
  grupoMes: { width: 56, alignItems: 'center' },
  mesLabel: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  detalhadoBotao: {
    marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center',
  },
  detalhadoBotaoTexto: { color: colors.darkText, fontWeight: '700', fontSize: 15 },
});
