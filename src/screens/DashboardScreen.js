import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { documentosVencendo } from '../utils/vencimentos';
import { colors, spacing, radius } from '../theme/colors';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { resumo: dashboardResumo, documentos } = useData();
  const primeiroNome = (user?.user_metadata?.full_name || user?.email || 'Juliano').split(' ')[0];
  const avisos = documentosVencendo(documentos, 30);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ marginTop: spacing.lg }}>
          <Subtitle>Olá,</Subtitle>
          <Title>{primeiroNome}! 👋</Title>
        </View>

        <Card style={{ marginTop: spacing.lg, backgroundColor: colors.primary, borderWidth: 0 }}>
          <Text style={styles.saldoLabel}>Saldo Total</Text>
          <Text style={styles.saldoValor}>{dashboardResumo.saldoTotal}</Text>
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

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.metricLabel}>Veículos Ativos</Text>
          <Text style={styles.metricValue}>{dashboardResumo.veiculosAtivos}</Text>
        </Card>

        {avisos.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Avisos de vencimento</Text>
            {avisos.slice(0, 5).map((doc) => (
              <TouchableOpacity
                key={doc.id}
                onPress={() => navigation.navigate('Frota', { screen: 'Documentos' })}
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
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.quickRow}>
            <QuickAction label="Financeiro" icon="💰" onPress={() => navigation.navigate('Financeiro')} />
            <QuickAction label="Frota" icon="🚚" onPress={() => navigation.navigate('Frota')} />
            <QuickAction
              label="Relatórios"
              icon="📊"
              onPress={() => navigation.navigate('Financeiro', { screen: 'Relatorios' })}
            />
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
    flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, marginRight: spacing.sm,
  },
  quickActionLabel: { color: colors.text, fontSize: 12, marginTop: spacing.xs },
});
