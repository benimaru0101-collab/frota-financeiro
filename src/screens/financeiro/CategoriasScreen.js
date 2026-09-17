import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, FilterTabs, IconButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing, radius } from '../../theme/colors';

const ABAS = ['Todas', 'Receitas', 'Despesas'];

function corPadrao(tipo) {
  return tipo === 'receita' ? colors.success : colors.danger;
}

function iconePadrao(tipo) {
  return tipo === 'receita' ? '💰' : '💸';
}

export default function CategoriasScreen({ navigation }) {
  const { categorias, deleteCategoria } = useData();
  const [busca, setBusca] = React.useState('');
  const [aba, setAba] = React.useState('Todas');

  const filtradas = categorias.filter((c) => {
    const bateBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const bateAba = aba === 'Todas' || c.tipo === (aba === 'Receitas' ? 'receita' : 'despesa');
    return bateBusca && bateAba;
  });

  function confirmarExclusao(item) {
    Alert.alert('Excluir categoria', `Excluir "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteCategoria(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Title>Categorias</Title>
        <IconButton onPress={() => navigation.navigate('NovaCategoria')} />
      </View>

      <FilterTabs options={ABAS} value={aba} onChange={setAba} />
      <Input placeholder="Buscar categoria" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />

      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma categoria encontrada.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('EditarCategoria', { categoria: item })}
            onLongPress={() => confirmarExclusao(item)}
          >
            <Card style={styles.item}>
              <View style={[styles.iconeCirculo, { backgroundColor: item.cor || corPadrao(item.tipo) }]}>
                <Text style={styles.iconeTexto}>{item.icone || iconePadrao(item.tipo)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.subtitulo}>{item.tipo === 'receita' ? 'Receita' : 'Despesa'}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
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
  nome: { color: colors.text, fontSize: 15, fontWeight: '600' },
  subtitulo: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: colors.textMuted, fontSize: 22, marginLeft: spacing.sm },
  vazio: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
