import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Card, Title, SecondaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function VeiculoDetalhesScreen({ route, navigation }) {
  const { veiculos } = useData();
  const veiculoRecebido = route?.params?.veiculo;

  // Busca a versão mais atual do veículo pelo id — assim, se o
  // usuário editar algo depois (quando o CRUD completo existir), esta
  // tela reflete o estado real em vez do snapshot passado na navegação.
  const veiculo =
    veiculos.find((v) => v.id === veiculoRecebido?.id) ??
    veiculoRecebido ?? {
      placa: 'ABC-1234', modelo: 'Mercedes FH 460', tipo: 'Cavalo Mecânico', status: 'Ativo', km: '175.000 km',
    };

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>{veiculo.placa}</Title>
        <Text style={styles.subtitle}>{veiculo.modelo} · {veiculo.status}</Text>
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <InfoRow label="Modelo" value={veiculo.modelo} />
        <InfoRow label="Tipo" value={veiculo.tipo} />
        <InfoRow label="Quilometragem" value={veiculo.km} />
        <InfoRow label="Status" value={veiculo.status} />
      </Card>

      <Text style={styles.sectionTitle}>Ações</Text>
      <SecondaryButton title="Viagens" onPress={() => navigation.navigate('Viagens')} style={{ marginBottom: spacing.sm }} />
      <SecondaryButton title="Manutenções" onPress={() => navigation.navigate('Manutencoes')} style={{ marginBottom: spacing.sm }} />
      <SecondaryButton title="Documentos" onPress={() => navigation.navigate('Documentos')} style={{ marginBottom: spacing.sm }} />
      <SecondaryButton title="Editar" onPress={() => navigation.navigate('EditarVeiculo', { veiculo })} />
    </Screen>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.textMuted, marginTop: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  label: { color: colors.textMuted },
  value: { color: colors.text, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
});
