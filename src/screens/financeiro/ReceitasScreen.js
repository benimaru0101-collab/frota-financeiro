import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing, radius } from '../../theme/colors';

export default function ReceitasScreen({ navigation }) {
  const { receitas, deleteReceita, updateReceita } = useData();
  const [busca, setBusca] = React.useState('');
  const filtradas = receitas.filter((r) => r.descricao.toLowerCase().includes(busca.toLowerCase()));

  function abrirOpcoes(item) {
    const pendente = item.status === 'pendente';
    const botoes = [{ text: 'Cancelar', style: 'cancel' }];
    if (pendente) {
      botoes.push({ text: 'Marcar como Recebido', onPress: () => updateReceita(item.id, { status: 'concluido' }) });
    } else {
      botoes.push({ text: 'Marcar como Pendente', onPress: () => updateReceita(item.id, { status: 'pendente' }) });
    }
    botoes.push({
      text: 'Excluir',
      style: 'destructive',
      onPress: () => {
        Alert.alert('Excluir receita', `Excluir "${item.descricao}"?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => deleteReceita(item.id) },
        ]);
      },
    });
    Alert.alert(item.descricao, item.valor, botoes);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Receitas</Title>
        <Subtitle>Toque e segure para ver as opções</Subtitle>
      </View>
      <Input placeholder="Buscar receita" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => abrirOpcoes(item)}>
            <Card style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.descricao}>{item.descricao}</Text>
                <View style={styles.linhaMeta}>
                  {item.data ? <Text style={styles.data}>{item.data}</Text> : null}
                  <View style={[styles.pill, { backgroundColor: item.status === 'pendente' ? colors.primary : colors.success }]}>
                    <Text style={styles.pillTexto}>{item.statusLabel}</Text>
                  </View>
                </View>
              </View>
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
  linhaMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  data: { color: colors.textMuted, fontSize: 12, marginRight: spacing.sm },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  pillTexto: { color: colors.darkText, fontSize: 10, fontWeight: '700' },
  valor: { color: colors.success, fontWeight: '700' },
});
