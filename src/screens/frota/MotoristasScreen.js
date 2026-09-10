import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Card, Title, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing, radius } from '../../theme/colors';

export default function MotoristasScreen({ navigation }) {
  const { motoristas } = useData();
  const [busca, setBusca] = React.useState('');
  const filtrados = motoristas.filter((m) => m.nome.toLowerCase().includes(busca.toLowerCase()));
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Motoristas</Title>
      </View>
      <Input placeholder="Buscar motorista" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.nome.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.cnh}>{item.cnh}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.status === 'Ativo' ? colors.success : colors.textMuted }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </Card>
        )}
      />
      <PrimaryButton title="+ Novo Motorista" onPress={() => navigation.navigate('NovoMotorista')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#1A1A1A', fontWeight: '700' },
  nome: { color: colors.text, fontWeight: '600' },
  cnh: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
