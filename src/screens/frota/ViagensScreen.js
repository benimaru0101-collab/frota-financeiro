import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function ViagensScreen({ navigation }) {
  const { viagens } = useData();
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Viagens</Title>
      </View>
      <Input placeholder="Buscar viagem" style={{ marginTop: spacing.md }} />
      <FlatList
        data={viagens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <Text style={styles.rota}>{item.origemDestino}</Text>
            <View style={styles.linha}>
              <Text style={styles.meta}>{item.placa} · {item.data}</Text>
              <Text style={styles.valor}>{item.valor}</Text>
            </View>
          </Card>
        )}
      />
      <PrimaryButton title="+ Nova Viagem" onPress={() => navigation.navigate('NovaViagem')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md },
  rota: { color: colors.text, fontWeight: '600', fontSize: 15 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { color: colors.textMuted, fontSize: 12 },
  valor: { color: colors.success, fontWeight: '700' },
});
