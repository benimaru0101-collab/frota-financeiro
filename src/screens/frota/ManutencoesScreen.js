import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, PrimaryButton } from '../../components/UI';
import { manutencoes } from '../../data/mockData';
import { colors, spacing } from '../../theme/colors';

export default function ManutencoesScreen() {
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Manutenções</Title>
      </View>
      <Input placeholder="Buscar manutenção" style={{ marginTop: spacing.md }} />
      <FlatList
        data={manutencoes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <View>
              <Text style={styles.placa}>{item.placa}</Text>
              <Text style={styles.meta}>{item.tipo} · {item.data}</Text>
            </View>
            <Text style={styles.valor}>{item.valor}</Text>
          </Card>
        )}
      />
      <PrimaryButton title="+ Nova Manutenção" onPress={() => {}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placa: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  valor: { color: colors.danger, fontWeight: '700' },
});
