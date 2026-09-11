import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function ViagensScreen({ navigation }) {
  const { viagens, deleteViagem } = useData();
  const [busca, setBusca] = React.useState('');
  const filtradas = viagens.filter(
    (v) =>
      v.origemDestino.toLowerCase().includes(busca.toLowerCase()) ||
      v.placa.toLowerCase().includes(busca.toLowerCase()) ||
      (v.motorista ?? '').toLowerCase().includes(busca.toLowerCase())
  );

  function confirmarExclusao(item) {
    Alert.alert('Excluir viagem', `Excluir a viagem ${item.origemDestino}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteViagem(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Viagens</Title>
        <Subtitle>Toque e segure para excluir</Subtitle>
      </View>
      <Input placeholder="Buscar viagem" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => confirmarExclusao(item)}>
            <Card style={styles.item}>
              <Text style={styles.rota}>{item.origemDestino}</Text>
              <Text style={styles.motorista}>{item.motorista ?? 'Motorista não informado'}</Text>
              <View style={styles.linha}>
                <Text style={styles.meta}>{item.placa} · {item.data}</Text>
                <Text style={styles.valor}>{item.valor}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
      <PrimaryButton title="+ Nova Viagem" onPress={() => navigation.navigate('NovaViagem')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md },
  rota: { color: colors.text, fontWeight: '600', fontSize: 15 },
  motorista: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { color: colors.textMuted, fontSize: 12 },
  valor: { color: colors.success, fontWeight: '700' },
});
