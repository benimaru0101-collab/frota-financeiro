import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function DocumentosScreen({ navigation }) {
  const { documentos, deleteDocumento } = useData();
  const [busca, setBusca] = React.useState('');
  const filtrados = documentos.filter(
    (d) => d.placa.toLowerCase().includes(busca.toLowerCase()) || d.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  function confirmarExclusao(item) {
    Alert.alert('Excluir documento', `Excluir ${item.tipo} de ${item.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteDocumento(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Documentos</Title>
        <Subtitle>Toque e segure para excluir</Subtitle>
      </View>
      <Input placeholder="Buscar documento" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => confirmarExclusao(item)}>
            <Card style={styles.item}>
              <Text style={styles.tipo}>📄 {item.tipo}</Text>
              <View>
                <Text style={styles.placa}>{item.placa}</Text>
                <Text style={styles.venc}>Vence: {item.vencimento}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
      <PrimaryButton title="+ Novo Documento" onPress={() => navigation.navigate('NovoDocumento')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipo: { color: colors.text, fontWeight: '600' },
  placa: { color: colors.textMuted, fontSize: 12, textAlign: 'right' },
  venc: { color: colors.danger, fontSize: 12, marginTop: 2 },
});
