import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { montarAlertas, contarPorSeveridade } from '../utils/alertas';
import { colors, spacing, radius } from '../theme/colors';

export default function DashboardScreen({ navigation }) {
  const { user, isAdmin } = useAuth();
  const { resumo: dashboardResumo, documentos, receitas, despesas } = useData();
  const primeiroNome = (user?.user_metadata?.full_name || user?.email || 'Juliano').split(' ')[0];
  const alertas = useMemo(
    () => montarAlertas({ documentos, receitas, despesas }, { podeVerFinanceiro: isAdmin }),
    [documentos, receitas, despesas, isAdmin]
  );
  const contagem = contarPorSeveridade(alertas);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ marginTop: spacing.lg }}>
          <Subtitle>Olá,</Subtitle>
          <Title>{primeiroNome}! 👋</Title>
        </View>

        {isAdmin && (
          <>
            <Card style={{ marginTop: spacing.lg, backgroundColor: colors.primary, borderWidth: 0 }}>
              <Text style={styles.saldoLabel}>Saldo Atual</Text>
              <Text style={styles.saldoValor}>{dashboardResumo.saldoAtual}</Text>
              <Text style={styles.saldoNota}>Só considera lançamentos já pagos/recebidos</Text>
            </Card>

            <View style={styles.row}>
              <Card style={styles.metade}>
                <Text style={styles.metricLabel}>Receitas do Mês</Text>
                <Text style={[styles.metricValue, { color: colors.success }]}>{dashboardResumo.receitasMes}</Text>
              </Card>
              <Card style={[styles.metade, { marginLeft: spacing.md }]}>
                <Text style={styles.metricLabel}>Despesas do Mês</Text>
                <Text style={[styles.metricValue, { color: colors.danger }]}>{dashboardResumo.despesasMes}</Text>
              </Card>
            </View>
          </>
        )}

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.metricLabel}>Veículos Ativos</Text>
          <Text style={styles.metricValue}>{dashboardResumo.veiculosAtivos}</Text>
        </Card>

        {isAdmin && dashboardResumo.projecaoFutura.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Projeção de Caixa</Text>
            <Text style={styles.projecaoSubtitulo}>Lançamentos pendentes, por mês previsto</Text>
            {dashboardResumo.projecaoFutura.map((grupo) => (
              <Card key={grupo.mes} style={styles.projecaoCard}>
                <Text style={styles.projecaoMes}>{grupo.mes}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
                  <Text style={styles.projecaoLinha}>A receber: <Text style={{ color: colors.success }}>{grupo.receitas}</Text></Text>
                  <Text style={styles.projecaoLinha}>A pagar: <Text style={{ color: colors.danger }}>{grupo.despesas}</Text></Text>
                </View>
                <Text style={styles.projecaoSaldo}>Saldo projetado: {grupo.saldoProjetado}</Text>
              </Card>
            ))}
          </View>
        )}

        {alertas.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <View style={styles.alertasCabecalho}>
              <Text style={styles.sectionTitle}>Alertas</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Mais', { screen: 'Alertas' })}>
                <Text style={styles.verTodos}>Ver todos ({alertas.length})</Text>
              </TouchableOpacity>
            </View>
            {contagem.critico > 0 && (
              <Text style={[styles.alertasResumo, { color: colors.danger }]}>
                {contagem.critico} item(ns) crítico(s) precisam de ação agora
              </Text>
            )}
            {alertas.slice(0, 5).map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => navigation.navigate(a.destino.aba, { screen: a.destino.tela })}
              >
                <Card style={styles.avisoCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.avisoTitulo}>{a.titulo}</Text>
                    <Text style={styles.avisoData}>{a.detalhe}</Text>
                  </View>
                  <Text style={[styles.avisoDias, { color: a.severidade === 'critico' ? colors.danger : a.severidade === 'atencao' ? colors.primary : colors.info }]}>
                    {a.dias < 0 ? `${Math.abs(a.dias)}d atrasado` : a.dias === 0 ? 'Hoje' : `${a.dias}d`}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.quickRow}>
            {isAdmin && <QuickAction label="Financeiro" icon="💰" onPress={() => navigation.navigate('Financeiro')} />}
            <QuickAction label="Frota" icon="🚚" onPress={() => navigation.navigate('Frota')} />
            {isAdmin && (
              <QuickAction
                label="Relatórios"
                icon="📊"
                onPress={() => navigation.navigate('Financeiro', { screen: 'Relatorios' })}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function QuickAction({ label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  saldoLabel: { color: '#1A1A1A', fontSize: 13, fontWeight: '600' },
  saldoValor: { color: '#1A1A1A', fontSize: 28, fontWeight: '800', marginTop: spacing.xs },
  saldoNota: { color: '#1A1A1A', opacity: 0.65, fontSize: 11, marginTop: spacing.xs },
  projecaoSubtitulo: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  projecaoCard: { marginTop: spacing.sm },
  projecaoMes: { color: colors.text, fontSize: 14, fontWeight: '700' },
  projecaoLinha: { color: colors.textMuted, fontSize: 12 },
  projecaoSaldo: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: spacing.xs },
  avisoCard: {
    marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  avisoTitulo: { color: colors.text, fontSize: 14, fontWeight: '600' },
  avisoData: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  avisoDias: { fontSize: 13, fontWeight: '700', marginLeft: spacing.sm },
  alertasCabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verTodos: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  alertasResumo: { fontSize: 12, fontWeight: '600', marginBottom: spacing.xs },
  row: { flexDirection: 'row', marginTop: spacing.md },
  metade: { flex: 1 },
  metricLabel: { color: colors.textMuted, fontSize: 12 },
  metricValue: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: {
    flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, marginRight: spacing.sm,
  },
  quickActionLabel: { color: colors.text, fontSize: 12, marginTop: spacing.xs },
});
