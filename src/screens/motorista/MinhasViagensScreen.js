import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, FilterTabs } from '../../components/UI';
import { useMotorista } from '../../contexts/MotoristaContext';
import { STATUS, dataBR, hojeISO } from '../../lib/motorista';
import StatusViagem from './StatusViagem';
import { colors, spacing } from '../../theme/colors';

const ABAS = ['Em aberto', 'Concluídas'];

export default function MinhasViagensScreen({ navigation }) {
  const { cadastro, viagens, carregando, erro, recarregar } = useMotorista();
  const [aba, setAba] = useState(ABAS[0]);

  if (carregando && !cadastro && viagens.length === 0) {
    return (
      <Screen style={styles.centro}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }

  if (!cadastro) {
    return (
      <Screen style={styles.centro}>
        <Text style={styles.icone}>🪪</Text>
        <Title style={{ textAlign: 'center' }}>Conta ainda não vinculada</Title>
        <Subtitle style={{ textAlign: 'center', marginTop: spacing.sm }}>
          {erro ? `Erro: ${erro}` : 'Peça ao administrador para ligar sua conta ao seu cadastro de motorista em Mais › Usuários e Papéis.'}
        </Subtitle>
        <Text style={styles.link} onPress={recarregar}>Tentar de novo</Text>
      </Screen>
    );
  }

  const hoje = hojeISO();
  const abertas = viagens.filter((v) => v.status !== STATUS.CONCLUIDA);
  const concluidas = viagens.filter((v) => v.status === STATUS.CONCLUIDA).reverse();
  const lista = aba === ABAS[0] ? abertas : concluidas;
  const emAndamento = abertas.filter((v) => v.status === STATUS.EM_ANDAMENTO).length;
  const deHoje = abertas.filter((v) => v.data_viagem === hoje).length;

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Subtitle>Olá,</Subtitle>
        <Title>{cadastro.nome.split(' ')[0]} 🚚</Title>
      </View>

      <View style={styles.resumo}>
        <Resumo rotulo="Hoje" valor={deHoje} />
        <Resumo rotulo="Em andamento" valor={emAndamento} destaque />
        <Resumo rotulo="Concluídas" valor={concluidas.length} />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <FilterTabs options={ABAS} value={aba} onChange={setAba} />
      </View>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={colors.primary} />}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {aba === ABAS[0] ? 'Nenhuma viagem em aberto. Puxe para atualizar.' : 'Nenhuma viagem concluída ainda.'}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ViagemMotorista', { id: item.id })}>
            <Card style={[styles.item, item.status === STATUS.EM_ANDAMENTO && styles.itemAtivo]}>
              <View style={styles.linha}>
                <StatusViagem status={item.status} />
                <Text style={styles.data}>{item.data_viagem === hoje ? 'Hoje' : dataBR(item.data_viagem)}</Text>
              </View>
              <Text style={styles.rota}>{item.origem} → {item.destino}</Text>
              <Text style={styles.meta}>
                {item.veiculos ? `${item.veiculos.placa} · ${item.veiculos.modelo}` : 'Veículo não informado'}
                {item.pendenteEnvio ? ' · ⏳ aguardando envio' : ''}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

function Resumo({ rotulo, valor, destaque }) {
  return (
    <Card style={[styles.resumoCard, destaque && { borderColor: colors.primary }]}>
      <Text style={[styles.resumoValor, destaque && { color: colors.primary }]}>{valor}</Text>
      <Text style={styles.resumoRotulo}>{rotulo}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  centro: { justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  icone: { fontSize: 48, marginBottom: spacing.md },
  link: { color: colors.primary, marginTop: spacing.lg, fontWeight: '600' },
  resumo: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  resumoCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  resumoValor: { color: colors.text, fontSize: 22, fontWeight: '800' },
  resumoRotulo: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  item: { marginTop: spacing.md },
  itemAtivo: { borderColor: colors.primary },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  data: { color: colors.textMuted, fontSize: 12 },
  rota: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.sm },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  vazio: { color: colors.textMuted, marginTop: spacing.lg, textAlign: 'center' },
});
