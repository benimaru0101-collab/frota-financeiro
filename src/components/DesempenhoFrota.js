import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, FilterTabs } from './UI';
import { formatValorBR } from '../utils/money';
import { colors, spacing, radius } from '../theme/colors';

// Dashboard de lucro e custo por KM. Recebe `resumo.operacional` do
// DataContext ({ mes, total }) e mostra:
//  - Lucro operacional = fretes concluídos − (combustível + manutenção)
//  - Custo, receita e lucro por KM rodado (hodômetro das viagens)
//  - Ranking por veículo
const PERIODOS = ['Este mês', 'Tudo'];

const moeda = (n) => formatValorBR(Number(n) || 0);
const porKm = (n) => (n == null ? '—' : `${moeda(n)}/km`);
const km = (n) => `${Number(n || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} km`;

export default function DesempenhoFrota({ operacional }) {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  if (!operacional) return null;
  const d = periodo === PERIODOS[0] ? operacional.mes : operacional.total;
  const lucroPositivo = d.lucro >= 0;
  const totalCusto = d.combustivel + d.manutencao;
  const pctComb = totalCusto > 0 ? d.combustivel / totalCusto : 0;

  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.titulo}>Desempenho da Frota</Text>
      <Text style={styles.sub}>Lucro e custo por KM das viagens concluídas</Text>
      <FilterTabs options={PERIODOS} value={periodo} onChange={setPeriodo} />

      <Card style={{ marginTop: spacing.sm }}>
        <Text style={styles.rotulo}>Lucro operacional</Text>
        <Text style={[styles.grande, { color: lucroPositivo ? colors.success : colors.danger }]}>{moeda(d.lucro)}</Text>
        <Text style={styles.nota}>
          {d.viagens} {d.viagens === 1 ? 'viagem concluída' : 'viagens concluídas'} · {km(d.km)} rodados
          {d.margem != null ? ` · margem ${(d.margem * 100).toFixed(0)}%` : ''}
        </Text>
      </Card>

      <View style={styles.linha3}>
        <Indicador rotulo="Custo/KM" valor={porKm(d.custoPorKm)} cor={colors.danger} />
        <Indicador rotulo="Receita/KM" valor={porKm(d.receitaPorKm)} cor={colors.success} />
        <Indicador rotulo="Lucro/KM" valor={porKm(d.lucroPorKm)} cor={d.lucroPorKm != null && d.lucroPorKm < 0 ? colors.danger : colors.primary} />
      </View>

      <Card style={{ marginTop: spacing.sm }}>
        <Linha rotulo="Receita de fretes" valor={moeda(d.receita)} cor={colors.success} />
        <Linha rotulo="Combustível" valor={moeda(d.combustivel)} cor={colors.danger} />
        <Linha rotulo="Manutenção" valor={moeda(d.manutencao)} cor={colors.danger} />
        {totalCusto > 0 && (
          <>
            <View style={styles.barra}>
              <View style={{ flex: pctComb, backgroundColor: colors.danger }} />
              <View style={{ flex: 1 - pctComb, backgroundColor: colors.info }} />
            </View>
            <Text style={styles.nota}>
              Combustível {(pctComb * 100).toFixed(0)}% · Manutenção {((1 - pctComb) * 100).toFixed(0)}% dos custos
            </Text>
          </>
        )}
        {d.km === 0 && d.viagens > 0 && (
          <Text style={[styles.nota, { color: colors.primary }]}>
            As viagens deste período não têm KM de saída/chegada — o custo por KM aparece quando o motorista informar o hodômetro.
          </Text>
        )}
      </Card>

      {d.porVeiculo.length > 0 && (
        <Card style={{ marginTop: spacing.sm }}>
          <Text style={styles.secao}>Por veículo</Text>
          {d.porVeiculo.map((v) => (
            <View key={v.placa} style={styles.veiculo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.placa}>{v.placa}</Text>
                <Text style={styles.nota}>{km(v.km)} · custo {porKm(v.custoPorKm)}</Text>
              </View>
              <Text style={[styles.lucroVeic, { color: v.lucro >= 0 ? colors.success : colors.danger }]}>{moeda(v.lucro)}</Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

function Indicador({ rotulo, valor, cor }) {
  return (
    <Card style={styles.indicador}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.medio, { color: cor }]} numberOfLines={1} adjustsFontSizeToFit>{valor}</Text>
    </Card>
  );
}

function Linha({ rotulo, valor, cor }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, { color: cor }]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  rotulo: { color: colors.textMuted, fontSize: 12 },
  grande: { fontSize: 26, fontWeight: '800', marginTop: spacing.xs },
  medio: { fontSize: 14, fontWeight: '700', marginTop: spacing.xs },
  nota: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
  linha3: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  indicador: { flex: 1, padding: spacing.sm },
  linha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  valor: { fontSize: 13, fontWeight: '700' },
  barra: { flexDirection: 'row', height: 8, borderRadius: radius.pill, overflow: 'hidden', marginTop: spacing.sm },
  secao: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: spacing.xs },
  veiculo: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  placa: { color: colors.text, fontSize: 13, fontWeight: '700' },
  lucroVeic: { fontSize: 13, fontWeight: '700', marginLeft: spacing.sm },
});
