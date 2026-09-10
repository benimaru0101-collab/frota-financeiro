import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { dashboardResumo } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const primeiroNome = (user?.user_metadata?.full_name || user?.email || 'Juliano').split(' ')[0];

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

        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.quickRow}>
            <QuickAction label="Financeiro" icon="💰" onPress={() => navigation.navigate('Financeiro')} />
            <QuickAction label="Frota" icon="🚚" onPress={() => navigation.navigate('Frota')} />
            <QuickAction label="Relatórios" icon="📊" onPress={() => {}} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function QuickAction({ label, icon, onPress }) {
  return (
    <View style={styles.quickAction}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  saldoLabel: { color: '#1A1A1A', fontSize: 13, fontWeight: '600' },
  saldoValor: { color: '#1A1A1A', fontSize: 28, fontWeight: '800', marginTop: spacing.xs },
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
