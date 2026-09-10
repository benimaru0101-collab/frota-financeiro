import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function ReceitasScreen({ navigation }) {
  const { receitas } = useData();
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Receitas</Title>
      </View>
      <Input placeholder="Buscar receita" style={{ marginTop: spacing.md }} />
      <FlatList
        data={receitas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <Text style={styles.descricao}>{item.descricao}</Text>
            <Text style={styles.valor}>{item.valor}</Text>
          </Card>
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
