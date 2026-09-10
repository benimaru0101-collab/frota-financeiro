import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing, radius } from '../../theme/colors';

export default function FrotaHomeScreen({ navigation }) {
  const { veiculos } = useData();
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Frota</Title>
      </View>
      <Input placeholder="Buscar veículo" style={{ marginTop: spacing.md }} />

      <View style={styles.menuRow}>
        <MenuChip label="Motoristas" onPress={() => navigation.navigate('Motoristas')} />
        <MenuChip label="Viagens" onPress={() => navigation.navigate('Viagens')} />
        <MenuChip label="Abastecimentos" onPress={() => navigation.navigate('Abastecimentos')} />
        <MenuChip label="Manutenções" onPress={() => navigation.navigate('Manutencoes')} />
        <MenuChip label="Documentos" onPress={() => navigation.navigate('Documentos')} />
      </View>

      <FlatList
        data={veiculos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('VeiculoDetalhes', { veiculo: item })}>
            <Card style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.placa}>{item.placa}</Text>
                <Text style={styles.modelo}>{item.modelo}</Text>
              </View>
              <StatusBadge status={item.status} />
            </Card>
          </TouchableOpacity>
        )}
      />
      <PrimaryButton title="+ Novo Veículo" onPress={() => navigation.navigate('NovoVeiculo')} />
    </Screen>
  );
}

function MenuChip({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatusBadge({ status }) {
  const ativo = status === 'Ativo';
  return (
    <View style={[styles.badge, { backgroundColor: ativo ? colors.success : colors.danger }]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  menuRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, marginBottom: spacing.sm },
  chip: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 8, marginRight: spacing.sm, marginBottom: spacing.sm,
  },
  chipText: { color: colors.text, fontSize: 12 },
  item: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placa: { color: colors.text, fontSize: 16, fontWeight: '700' },
  modelo: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  badge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
