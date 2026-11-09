import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Title, Subtitle, SectionHeader } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { documentosVencendo } from '../utils/vencimentos';
import DesempenhoFrota from '../components/DesempenhoFrota';
import BannerAtualizacao from '../components/BannerAtualizacao';
import { colors, spacing, radius } from '../theme/colors';

export default function DashboardScreen({ navigation }) {
  const { user, isAdmin } = useAuth();
  const { resumo: dashboardResumo, documentos } = useData();
  const primeiroNome = (user?.user_metadata?.full_name || user?.email || 'Juliano').split(' ')[0];
  const avisos = documentosVencendo(documentos, 30);
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.cabecalho}>
          <View style={{ flex: 1 }}>
            <Subtitle style={{ marginTop: 0, textTransform: 'capitalize' }}>{hoje}</Subtitle>
            <Title>Olá, {primeiroNome}!</Title>
          </View>
          <View style={styles.avatar} accessible accessibilityLabel={`Usuário ${primeiroNome}`}>
            <Text style={styles.avatarLetra}>{primeiroNome.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <BannerAtualizacao />

        {isAdmin && (
          <>
            <Card
              style={{ marginTop: spacing.lg, backgroundColor: colors.primary, borderWidth: 0 }}
              accessible
              accessibilityLabel={`Saldo atual: ${dashboardResumo.saldoAtual}. Considera só lançamentos já pagos ou recebidos.`}
            >
              <View style={styles.linha}>
                <Ionicons name="wallet" size={18} color="#1A1A1A" />
                <Text style={[styles.saldoLabel, { marginLeft: spacing.xs }]}>Saldo atual</Text>
              </View>
              <Text style={styles.saldoValor}>{dashboardResumo.saldoAtual}</Text>
              <Text style={styles.saldoNota}>Só considera lançamentos já pagos/recebidos</Text>
            </Card>

            <View style={styles.row}>
              <Metrica icone="trending-up" cor={colors.success} rotulo="Receitas do mês" valor={dashboardResumo.receitasMes} />
              <View style={{ width: spacing.md }} />
              <Metrica icone="trending-down" cor={colors.danger} rotulo="Despesas do mês" valor={dashboardResumo.despesasMes} />
            </View>
          </>
        )}

        <View style={styles.row}>
          <Metrica icone="bus" cor={colors.info} rotulo="Veículos ativos" valor={String(dashboardResumo.veiculosAtivos)} />
        </View>

        {isAdmin && <DesempenhoFrota operacional={dashboardResumo.operacional} />}

        {isAdmin && dashboardResumo.projecaoFutura.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader icone="calendar-outline" titulo="Projeção de caixa" />
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

        {avisos.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader
              icone="alert-circle-outline"
              titulo="Avisos de vencimento"
              acao="Ver todos"
              aoTocarAcao={() => navigation.navigate('Frota', { screen: 'Documentos' })}
            />
            {avisos.slice(0, 5).map((doc) => (
              <TouchableOpacity
                key={doc.id}
                onPress={() => navigation.navigate('Frota', { screen: 'Documentos' })}
                accessibilityRole="button"
                accessibilityLabel={`${doc.tipo} do veículo ${doc.placa}, ${
                  doc.diasRestantes < 0
                    ? `vencido há ${Math.abs(doc.diasRestantes)} dias`
                    : doc.diasRestantes === 0
                    ? 'vence hoje'
                    : `vence em ${doc.diasRestantes} dias`
                }`}
              >
                <Card style={styles.avisoCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.avisoTitulo}>{doc.tipo} — {doc.placa}</Text>
                    <Text style={styles.avisoData}>Vence em {doc.vencimento}</Text>
                  </View>
                  <Text style={[styles.avisoDias, { color: doc.diasRestantes < 0 ? colors.danger : colors.primary }]}>
                    {doc.diasRestantes < 0
                      ? `${Math.abs(doc.diasRestantes)}d atrasado`
                      : doc.diasRestantes === 0
                      ? 'Hoje'
                      : `${doc.diasRestantes}d`}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader icone="flash-outline" titulo="Acesso rápido" />
          <View style={styles.quickRow}>
            {isAdmin && <QuickAction label="Financeiro" icon="wallet-outline" onPress={() => navigation.navigate('Financeiro')} />}
            <QuickAction label="Frota" icon="bus-outline" onPress={() => navigation.navigate('Frota')} />
            {isAdmin && (
              <QuickAction
                label="Relatórios"
                icon="bar-chart-outline"
                onPress={() => navigation.navigate('Financeiro', { screen: 'Relatorios' })}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Metrica({ icone, cor, rotulo, valor }) {
  return (
    <Card style={styles.metade} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <View style={[styles.metricaIcone, { backgroundColor: cor + '22' }]}>
        <Ionicons name={icone} size={18} color={cor} />
      </View>
      <Text style={styles.metricLabel}>{rotulo}</Text>
      <Text style={[styles.metricValue, { color: cor === colors.info ? colors.text : cor }]} adjustsFontSizeToFit numberOfLines={1}>
        {valor}
      </Text>
    </Card>
  );
}

function QuickAction({ label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Abrir ${label}`}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cabecalho: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginLeft: spacing.md,
  },
  avatarLetra: { color: '#1A1A1A', fontSize: 20, fontWeight: '800' },
  linha: { flexDirection: 'row', alignItems: 'center' },
  metricaIcone: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
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
  row: { flexDirection: 'row', marginTop: spacing.md },
  metade: { flex: 1 },
  metricLabel: { color: colors.textMuted, fontSize: 12 },
  metricValue: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: {
    flex: 1, alignItems: 'center', minHeight: 72, justifyContent: 'center', backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, marginRight: spacing.sm,
  },
  quickActionLabel: { color: colors.text, fontSize: 12, marginTop: spacing.xs },
});
