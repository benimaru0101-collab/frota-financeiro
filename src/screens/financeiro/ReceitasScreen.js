import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function ReceitasScreen({ navigation }) {
  const { receitas, deleteReceita } = useData();
  const [busca, setBusca] = React.useState('');
  const filtradas = receitas.filter((r) => r.descricao.toLowerCase().includes(busca.toLowerCase()));

  function confirmarExclusao(item) {
    Alert.alert('Excluir receita', `Excluir "${item.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteReceita(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Receitas</Title>
        <Subtitle>Toque e segure para excluir</Subtitle>
      </View>
      <Input placeholder="Buscar receita" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => confirmarExclusao(item)}>
            <Card style={styles.item}>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <Text style={styles.valor}>{item.valor}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
      <PrimaryButton title="+ Nova Receita" onPress={() => navigation.navigate('NovaReceita')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  descricao: { color: colors.text, fontSize: 15 },
  valor: { color: colors.success, fontWeight: '700' },
});
