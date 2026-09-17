import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function ManutencoesScreen({ navigation }) {
  const { manutencoes, deleteManutencao } = useData();
  const [busca, setBusca] = React.useState('');
  const filtradas = manutencoes.filter(
    (m) => m.placa.toLowerCase().includes(busca.toLowerCase()) || m.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  function confirmarExclusao(item) {
    Alert.alert('Excluir manutenção', `Excluir a manutenção de ${item.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteManutencao(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Manutenções</Title>
        <Subtitle>Toque para editar · toque e segure para excluir</Subtitle>
      </View>
      <Input placeholder="Buscar manutenção" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('EditarManutencao', { manutencao: item })}
            onLongPress={() => confirmarExclusao(item)}
          >
            <Card style={styles.item}>
              <View>
                <Text style={styles.placa}>{item.placa}</Text>
                <Text style={styles.meta}>{item.tipo} · {item.data}</Text>
              </View>
              <Text style={styles.valor}>{item.valor}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
      <PrimaryButton title="+ Nova Manutenção" onPress={() => navigation.navigate('NovaManutencao')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  placa: { color: colors.text, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  valor: { color: colors.danger, fontWeight: '700' },
});
