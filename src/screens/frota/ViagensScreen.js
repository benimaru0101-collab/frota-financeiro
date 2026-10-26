import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';
import StatusViagem from '../motorista/StatusViagem';
import { abrirRotaNoMaps, adicionarViagemNaAgenda } from '../../lib/google';

export default function ViagensScreen({ navigation }) {
  const { viagens, deleteViagem } = useData();
  const [busca, setBusca] = React.useState('');
  const filtradas = viagens.filter(
    (v) =>
      v.origemDestino.toLowerCase().includes(busca.toLowerCase()) ||
      v.placa.toLowerCase().includes(busca.toLowerCase()) ||
      (v.motorista ?? '').toLowerCase().includes(busca.toLowerCase())
  );

  function confirmarExclusao(item) {
    Alert.alert('Excluir viagem', `Excluir a viagem ${item.origemDestino}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteViagem(item.id) },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Viagens</Title>
        <Subtitle>Toque para editar · toque e segure para excluir</Subtitle>
      </View>
      <Input placeholder="Buscar viagem" style={{ marginTop: spacing.md }} value={busca} onChangeText={setBusca} />
      <FlatList
        data={filtradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('EditarViagem', { viagem: item })}
            onLongPress={() => confirmarExclusao(item)}
          >
            <Card style={styles.item}>
              <View style={styles.linha}>
                <Text style={[styles.rota, { flex: 1 }]}>{item.origemDestino}</Text>
                {item.status ? <StatusViagem status={item.status} /> : null}
              </View>
              <Text style={styles.motorista}>{item.motorista ?? 'Motorista não informado'}</Text>
              <View style={styles.linha}>
                <Text style={styles.meta}>{item.placa} · {item.data}{item.kmRodados != null ? ` · ${item.kmRodados.toLocaleString('pt-BR')} km` : ''}{item.comprovanteUrl ? ' · 📎 comprovante' : ''}{item.pendenteEnvio ? ' · ⏳ aguardando envio' : ''}</Text>
                <Text style={styles.valor}>{item.valor}</Text>
              </View>
              <View style={styles.acoes}>
                <TouchableOpacity onPress={() => abrirRotaNoMaps(item.origem, item.destino)}>
                  <Text style={styles.acao}>🗺️ Rota no Maps</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => adicionarViagemNaAgenda({ origem: item.origem, destino: item.destino, dataISO: item.dataISO, motorista: item.motorista, placa: item.placa })}>
                  <Text style={styles.acao}>📅 Agenda</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
      <PrimaryButton title="+ Nova Viagem" onPress={() => navigation.navigate('NovaViagem')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.md },
  rota: { color: colors.text, fontWeight: '600', fontSize: 15 },
  motorista: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { color: colors.textMuted, fontSize: 12 },
  valor: { color: colors.success, fontWeight: '700' },
  acoes: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  acao: { color: colors.primary, fontSize: 12, fontWeight: '600' },
});
