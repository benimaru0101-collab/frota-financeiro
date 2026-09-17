import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, StatPill } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { formatValorBR, parseValorBR } from '../../utils/money';
import { FILTROS_PADRAO, filtrarLancamentos, rotuloPeriodo } from '../../utils/relatorios';
import { colors, spacing } from '../../theme/colors';

export default function RelatorioDetalhadoScreen({ route, navigation }) {
  const { receitas, despesas } = useData();
  const [filtros, setFiltros] = useState(route?.params?.filtros ?? FILTROS_PADRAO);

  useEffect(() => {
    if (route?.params?.filtros) {
      setFiltros(route.params.filtros);
    }
  }, [route?.params?.filtros]);

  const { receitasFiltradas, despesasFiltradas } = useMemo(
    () => filtrarLancamentos({ receitas, despesas }, filtros),
    [receitas, despesas, filtros]
  );

  const totalReceitas = useMemo(() => receitasFiltradas.reduce((s, r) => s + parseValorBR(r.valor), 0), [receitasFiltradas]);
  const totalDespesas = useMemo(() => despesasFiltradas.reduce((s, d) => s + parseValorBR(d.valor), 0), [despesasFiltradas]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.headerRow}>
          <View>
            <Title>Relatório Detalhado</Title>
            <Subtitle>{rotuloPeriodo(filtros.periodo)}</Subtitle>
          </View>
          <TouchableOpacity
            style={styles.filtrosBotao}
            onPress={() => navigation.navigate('FiltrosRelatorio', { filtrosAtuais: filtros, origem: 'RelatorioDetalhado' })}
          >
            <Text style={styles.filtrosBotaoTexto}>⚙ Filtros</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.statsRow, { marginTop: spacing.lg }]}>
          <StatPill label="Receitas" value={formatValorBR(totalReceitas)} positive />
          <StatPill label="Despesas" value={formatValorBR(totalDespesas)} positive={false} />
        </View>
        <View style={[styles.statsRow, { marginTop: spacing.sm }]}>
          <StatPill label="Saldo do Período" value={formatValorBR(totalReceitas - totalDespesas)} positive={totalReceitas - totalDespesas >= 0} />
        </View>

        <Text style={styles.sectionTitle}>Receitas ({receitasFiltradas.length})</Text>
        <Card>
          {receitasFiltradas.length > 0 ? (
            receitasFiltradas.map((item) => (
              <View key={item.id} style={styles.linha}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.descricao}>{item.descricao}</Text>
                  {item.data ? <Text style={styles.data}>{item.data}</Text> : null}
                </View>
                <Text style={[styles.valor, { color: colors.success }]}>{item.valor}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.vazio}>Nenhuma receita no período.</Text>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Despesas ({despesasFiltradas.length})</Text>
        <Card>
          {despesasFiltradas.length > 0 ? (
            despesasFiltradas.map((item) => (
              <View key={item.id} style={styles.linha}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.descricao}>{item.descricao}</Text>
                  <Text style={styles.data}>{item.categoria}{item.data ? ` · ${item.data}` : ''}</Text>
                </View>
                <Text style={[styles.valor, { color: colors.danger }]}>{item.valor}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.vazio}>Nenhuma despesa no período.</Text>
          )}
        </Card>
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  linha: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  descricao: { color: colors.text, fontSize: 14 },
  data: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  valor: { fontWeight: '700', marginLeft: spacing.sm },
  vazio: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
});
