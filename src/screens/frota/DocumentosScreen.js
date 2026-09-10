import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function DocumentosScreen({ navigation }) {
  const { documentos } = useData();
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Documentos</Title>
      </View>
      <Input placeholder="Buscar documento" style={{ marginTop: spacing.md }} />
      <FlatList
        data={documentos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <Text style={styles.tipo}>📄 {item.tipo}</Text>
            <View>
              <Text style={styles.placa}>{item.placa}</Text>
              <Text style={styles.venc}>Vence: {item.vencimento}</Text>
            </View>
          </Card>
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
