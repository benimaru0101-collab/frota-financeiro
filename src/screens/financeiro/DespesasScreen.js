import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing, radius } from '../../theme/colors';

export default function DespesasScreen({ navigation }) {
  const { despesas, resumo, deleteDespesa, updateDespesa } = useData();
  const [busca, setBusca] = React.useState('');
  const filtradas = despesas.filter((d) => d.descricao.toLowerCase().includes(busca.toLowerCase()));

  function abrirOpcoes(item) {
    const pendente = item.status === 'pendente';
    const botoes = [{ text: 'Cancelar', style: 'cancel' }];
    if (pendente) {
      botoes.push({ text: 'Marcar como Pago', onPress: () => updateDespesa(item.id, { status: 'concluido' }) });
    } else {
      botoes.push({ text: 'Marcar como Pendente', onPress: () => updateDespesa(item.id, { status: 'pendente' }) });
    }
    botoes.push({
      text: 'Excluir',
      style: 'destructive',
      onPress: () => {
        Alert.alert('Excluir despesa', `Excluir "${item.descricao}"?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => deleteDespesa(item.id) },
        ]);
      },
    });
    Alert.alert(item.descricao, item.valor, botoes);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Despesas</Title>
        <Subtitle>Toque e segure para ver as opções</Subtitle>
      </View>
      <Input placeholder="Buscar despesa" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => abrirOpcoes(item)}>
            <Card style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.descricao}>{item.descricao}</Text>
                <View style={styles.linhaMeta}>
                  <Text style={styles.categoria}>{item.categoria}{item.data ? ` · ${item.data}` : ''}</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: item.status === 'pendente' ? colors.primary : colors.success, marginTop: 4 }]}>
                  <Text style={styles.pillTexto}>{item.statusLabel}</Text>
                </View>
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
  linhaMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  categoria: { color: colors.textMuted, fontSize: 12 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  pillTexto: { color: colors.darkText, fontSize: 10, fontWeight: '700' },
  valor: { color: colors.danger, fontWeight: '700' },
  total: { color: colors.textMuted, textAlign: 'right', marginBottom: spacing.md },
});
