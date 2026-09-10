import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function DespesasScreen({ navigation }) {
  const { despesas, resumo, deleteDespesa } = useData();
  const [busca, setBusca] = React.useState('');
  const filtradas = despesas.filter((d) => d.descricao.toLowerCase().includes(busca.toLowerCase()));

  function confirmarExclusao(item) {
    Alert.alert('Excluir despesa', `Excluir "${item.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteDespesa(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Despesas</Title>
        <Subtitle>Toque e segure para excluir</Subtitle>
      </View>
      <Input placeholder="Buscar despesa" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => confirmarExclusao(item)}>
            <Card style={styles.item}>
              <View>
                <Text style={styles.descricao}>{item.descricao}</Text>
                <Text style={styles.categoria}>{item.categoria}</Text>
              </View>
              <Text style={styles.valor}>{item.valor}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.total}>Total do Mês: {resumo.despesasMes}</Text>
      <PrimaryButton title="+ Nova Despesa" onPress={() => navigation.navigate('NovaDespesa')} />
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
