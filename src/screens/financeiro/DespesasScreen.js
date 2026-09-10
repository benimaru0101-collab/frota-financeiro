import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, PrimaryButton } from '../../components/UI';
import { despesas, dashboardResumo } from '../../data/mockData';
import { colors, spacing } from '../../theme/colors';

export default function DespesasScreen() {
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Despesas</Title>
      </View>
      <Input placeholder="Buscar despesa" style={{ marginTop: spacing.md }} />
      <FlatList
        data={despesas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <View>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <Text style={styles.categoria}>{item.categoria}</Text>
            </View>
            <Text style={styles.valor}>{item.valor}</Text>
          </Card>
        )}
      />
      <Text style={styles.total}>Total do Mês: {dashboardResumo.despesasMes}</Text>
      <PrimaryButton title="+ Nova Despesa" onPress={() => {}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  descricao: { color: colors.text, fontSize: 15 },
  categoria: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  valor: { color: colors.danger, fontWeight: '700' },
  total: { color: colors.textMuted, textAlign: 'right', marginBottom: spacing.md },
});
