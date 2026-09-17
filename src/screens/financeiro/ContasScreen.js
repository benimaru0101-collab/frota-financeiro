import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, FilterTabs, IconButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

const ABAS = ['Todas', 'Bancárias', 'Caixa'];

function iconeConta(tipo) {
  return tipo === 'Bancária' ? '🏦' : '💵';
}

function corConta(tipo) {
  return tipo === 'Bancária' ? colors.info : colors.primary;
}

export default function ContasScreen({ navigation }) {
  const { contas, deleteConta } = useData();
  const [busca, setBusca] = React.useState('');
  const [aba, setAba] = React.useState('Todas');

  const filtradas = contas.filter((c) => {
    const bateBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const bateAba = aba === 'Todas' || c.tipo === (aba === 'Bancárias' ? 'Bancária' : 'Caixa');
    return bateBusca && bateAba;
  });

  function confirmarExclusao(item) {
    Alert.alert('Excluir conta', `Excluir "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteConta(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Title>Contas</Title>
        <IconButton onPress={() => navigation.navigate('NovaConta')} />
      </View>

      <FilterTabs options={ABAS} value={aba} onChange={setAba} />
      <Input placeholder="Buscar conta" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma conta encontrada.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('EditarConta', { conta: item })}
            onLongPress={() => confirmarExclusao(item)}
          >
            <Card style={styles.item}>
              <View style={[styles.iconeCirculo, { backgroundColor: corConta(item.tipo) }]}>
                <Text style={styles.iconeTexto}>{iconeConta(item.tipo)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.subtitulo}>{item.banco || item.descricao || item.tipo}</Text>
              </View>
              <Text style={styles.saldo}>{item.saldo}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' },
  iconeCirculo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconeTexto: { fontSize: 18 },
  nome: { color: colors.text, fontSize: 16, fontWeight: '600' },
  subtitulo: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  saldo: { color: colors.text, fontWeight: '700', marginLeft: spacing.sm },
  vazio: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
