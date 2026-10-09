import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing, radius } from '../../theme/colors';

export default function DividasScreen({ navigation }) {
  const { dividas, despesas, deleteDivida } = useData();

  function progressoDaDivida(divida) {
    const parcelas = despesas.filter((d) => d.dividaId === divida.id);
    const pagas = parcelas.filter((d) => d.status !== 'pendente').length;
    return { total: divida.numParcelas, pagas, geradas: parcelas.length };
  }

  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir dívida',
      `Excluir "${item.descricao}"? As parcelas já geradas continuam como despesas avulsas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteDivida(item.id) },
      ]
    );
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Dívidas e Financiamentos</Title>
        <Subtitle>Toque e segure para excluir</Subtitle>
      </View>
      <FlatList
        data={dividas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <Text style={{ color: colors.textMuted, marginTop: spacing.lg }}>
            Nenhuma dívida ou financiamento cadastrado ainda.
          </Text>
        }
        renderItem={({ item }) => {
          const progresso = progressoDaDivida(item);
          return (
            <TouchableOpacity onLongPress={() => confirmarExclusao(item)}>
              <Card style={styles.item}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.descricao}>{item.descricao}</Text>
                    {item.credor ? <Text style={styles.meta}>{item.credor}</Text> : null}
                    <Text style={styles.meta}>Início: {item.dataInicio}{item.placa ? ` · ${item.placa}` : ''}</Text>
                    {item.valorQuitacao ? <Text style={styles.meta}>Quitação antecipada: {item.valorQuitacao}</Text> : null}
                  </View>
                  <Text style={styles.valor}>{item.valorTotal}</Text>
                </View>
                <View style={styles.progressoLinha}>
                  <View style={styles.progressoBarraFundo}>
                    <View
                      style={[
                        styles.progressoBarraPreenchida,
                        { width: `${progresso.total ? Math.round((progresso.pagas / progresso.total) * 100) : 0}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressoTexto}>{progresso.pagas}/{progresso.total} parcelas pagas</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
      <PrimaryButton title="+ Nova Dívida / Financiamento" onPress={() => navigation.navigate('NovaDivida')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginBottom: spacing.md },
  descricao: { color: colors.text, fontSize: 15, fontWeight: '600' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  valor: { color: colors.danger, fontWeight: '700' },
  progressoLinha: { marginTop: spacing.sm },
  progressoBarraFundo: { height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  progressoBarraPreenchida: { height: 6, backgroundColor: colors.primary },
  progressoTexto: { color: colors.textMuted, fontSize: 11, marginTop: spacing.xs },
});
