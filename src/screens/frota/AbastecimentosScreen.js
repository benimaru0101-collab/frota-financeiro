import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function AbastecimentosScreen({ navigation }) {
  const { abastecimentos } = useData();
  const [busca, setBusca] = React.useState('');
  const filtrados = abastecimentos.filter((a) => a.placa.toLowerCase().includes(busca.toLowerCase()));
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Abastecimentos</Title>
      </View>
      <Input placeholder="Buscar abastecimento" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <View>
              <Text style={styles.placa}>{item.placa}</Text>
              <Text style={styles.meta}>{item.litros} · {item.data}</Text>
            </View>
            <Text style={styles.valor}>{item.valor}</Text>
          </Card>
        )}
      />
      <PrimaryButton title="+ Novo Abastecimento" onPress={() => navigation.navigate('NovoAbastecimento')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placa: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  valor: { color: colors.danger, fontWeight: '700' },
});
