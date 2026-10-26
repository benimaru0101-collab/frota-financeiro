import React, { useState } from 'react';
import { View, Text, Image, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Label, Input, PrimaryButton, SecondaryButton } from '../../components/UI';
import { useMotorista } from '../../contexts/MotoristaContext';
import { STATUS, dataBR, horaBR, iniciarViagem, finalizarViagem, lerKm, formatKm } from '../../lib/motorista';
import { escolherDaGaleria, tirarFoto } from '../../lib/upload';
import StatusViagem from './StatusViagem';
import { abrirRotaNoMaps, adicionarViagemNaAgenda } from '../../lib/google';
import { colors, spacing, radius } from '../../theme/colors';

export default function ViagemMotoristaScreen({ route, navigation }) {
  const { viagens, substituirViagem } = useMotorista();
  const viagem = viagens.find((v) => v.id === route.params?.id);
  const [salvando, setSalvando] = useState(false);
  const [foto, setFoto] = useState(null);
  const [observacao, setObservacao] = useState('');
  const kmVeiculo = viagem?.veiculos?.km_atual;
  const [kmInicial, setKmInicial] = useState(kmVeiculo != null ? String(Math.round(Number(kmVeiculo))) : '');
  const [kmFinal, setKmFinal] = useState('');

  if (!viagem) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted, marginTop: spacing.xl }}>Viagem não encontrada.</Text>
        <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </Screen>
    );
  }

  async function handleIniciar() {
    const km = lerKm(kmInicial);
    if (km === null) {
      Alert.alert('Informe o KM', 'Digite a quilometragem que aparece no painel do veículo antes de sair.');
      return;
    }
    if (kmVeiculo != null && km < Number(kmVeiculo)) {
      const seguir = await new Promise((resolve) =>
        Alert.alert('KM menor que o cadastrado', `O último KM registrado deste veículo é ${formatKm(kmVeiculo)}. Iniciar mesmo assim?`, [
          { text: 'Corrigir', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Iniciar', onPress: () => resolve(true) },
        ])
      );
      if (!seguir) return;
    }
    setSalvando(true);
    try {
      const atualizada = await iniciarViagem(viagem.id, km, viagem);
      substituirViagem(atualizada);
      if (atualizada.pendenteEnvio) {
        Alert.alert('Sem internet', 'A viagem foi iniciada no aparelho e será enviada automaticamente quando a conexão voltar.');
      }
    } catch (e) {
      Alert.alert('Não foi possível iniciar', e?.message ?? '');
    } finally {
      setSalvando(false);
    }
  }

  async function escolherFoto(origem) {
    const r = origem === 'camera' ? await tirarFoto() : await escolherDaGaleria();
    if (r.semPermissao) Alert.alert('Permissão negada', 'Libere o acesso à câmera/galeria nas configurações do celular.');
    if (!r.cancelado) setFoto(r.asset);
  }

  async function handleFinalizar() {
    const km = lerKm(kmFinal);
    if (km === null) {
      Alert.alert('Informe o KM de chegada', 'Digite a quilometragem que aparece no painel do veículo ao chegar.');
      return;
    }
    if (viagem.km_inicial != null && km < Number(viagem.km_inicial)) {
      Alert.alert('KM inválido', `O KM de chegada não pode ser menor que o de saída (${formatKm(viagem.km_inicial)}).`);
      return;
    }
    if (!foto) {
      const seguir = await new Promise((resolve) =>
        Alert.alert('Sem comprovante', 'Finalizar a entrega sem foto do comprovante?', [
          { text: 'Voltar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Finalizar assim', onPress: () => resolve(true) },
        ])
      );
      if (!seguir) return;
    }
    setSalvando(true);
    try {
      const atualizada = await finalizarViagem(viagem.id, { fotoAsset: foto, observacao, kmFinal: km }, viagem);
      substituirViagem(atualizada);
      if (atualizada.pendenteEnvio) {
        Alert.alert('Entrega salva sem internet', 'A finalização e a foto ficaram guardadas no aparelho e serão enviadas automaticamente quando a conexão voltar.');
      } else {
        Alert.alert('Entrega finalizada', 'Bom trabalho! A viagem foi registrada como concluída.');
      }
    } catch (e) {
      Alert.alert('Não foi possível finalizar', e?.message ?? '');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen scroll>
      <View style={{ marginTop: spacing.lg }}>
        <StatusViagem status={viagem.status} />
        {viagem.pendenteEnvio && <Text style={styles.pendente}>⏳ Aguardando internet para enviar</Text>}
        <Title style={{ marginTop: spacing.sm }}>{viagem.origem} → {viagem.destino}</Title>
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Linha rotulo="Data" valor={dataBR(viagem.data_viagem)} />
        <Linha rotulo="Veículo" valor={viagem.veiculos ? `${viagem.veiculos.placa} · ${viagem.veiculos.modelo}` : '—'} />
        {viagem.iniciada_em && <Linha rotulo="Iniciada" valor={horaBR(viagem.iniciada_em)} />}
        {viagem.finalizada_em && <Linha rotulo="Finalizada" valor={horaBR(viagem.finalizada_em)} />}
        {viagem.km_inicial != null && <Linha rotulo="KM de saída" valor={formatKm(viagem.km_inicial)} />}
        {viagem.km_final != null && <Linha rotulo="KM de chegada" valor={formatKm(viagem.km_final)} />}
        {viagem.km_inicial != null && viagem.km_final != null && (
          <Linha rotulo="KM rodados" valor={formatKm(Number(viagem.km_final) - Number(viagem.km_inicial))} />
        )}
      </Card>

      <View style={styles.botoes}>
        <SecondaryButton title="🗺️ Ver rota no Maps" onPress={() => abrirRotaNoMaps(viagem.origem, viagem.destino)} style={{ flex: 1 }} />
        <SecondaryButton
          title="📅 Google Agenda"
          onPress={() => adicionarViagemNaAgenda({ origem: viagem.origem, destino: viagem.destino, dataISO: viagem.data_viagem, motorista: undefined, placa: viagem.veiculos?.placa })}
          style={{ flex: 1 }}
        />
      </View>

      {viagem.status === STATUS.AGENDADA && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.secao}>Saída</Text>
          <Label>KM no painel do veículo</Label>
          <Input placeholder="Ex.: 182450" keyboardType="numeric" value={kmInicial} onChangeText={setKmInicial} />
          {kmVeiculo != null && <Text style={styles.dica}>Último KM registrado: {formatKm(kmVeiculo)}</Text>}
          <PrimaryButton title="▶  Iniciar viagem" onPress={handleIniciar} loading={salvando} style={{ marginTop: spacing.md }} />
        </Card>
      )}

      {viagem.status === STATUS.EM_ANDAMENTO && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.secao}>Chegada</Text>
          <Label>KM no painel do veículo</Label>
          <Input placeholder="Ex.: 182900" keyboardType="numeric" value={kmFinal} onChangeText={setKmFinal} />
          {viagem.km_inicial != null && (
            <Text style={styles.dica}>
              Saída: {formatKm(viagem.km_inicial)}
              {lerKm(kmFinal) != null && lerKm(kmFinal) >= Number(viagem.km_inicial)
                ? ` · Rodados: ${formatKm(lerKm(kmFinal) - Number(viagem.km_inicial))}`
                : ''}
            </Text>
          )}
          <Text style={[styles.secao, { marginTop: spacing.md }]}>Comprovante de entrega</Text>
          {foto ? (
            <Image source={{ uri: foto.uri }} style={styles.foto} />
          ) : (
            <Text style={styles.dica}>Tire uma foto do canhoto ou da nota assinada.</Text>
          )}
          <View style={styles.botoes}>
            <SecondaryButton title="📷 Câmera" onPress={() => escolherFoto('camera')} style={{ flex: 1 }} />
            <SecondaryButton title="🖼️ Galeria" onPress={() => escolherFoto('galeria')} style={{ flex: 1 }} />
          </View>
          <Label style={{ marginTop: spacing.md }}>Observação (opcional)</Label>
          <Input placeholder="Ex.: entregue ao porteiro" value={observacao} onChangeText={setObservacao} />
          <PrimaryButton title="✓  Finalizar entrega" onPress={handleFinalizar} loading={salvando} style={{ marginTop: spacing.md }} />
        </Card>
      )}

      {viagem.status === STATUS.CONCLUIDA && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.secao}>Entrega concluída</Text>
          {viagem.comprovante_url ? (
            <Image source={{ uri: viagem.comprovante_url }} style={styles.foto} />
          ) : (
            <Text style={styles.dica}>Finalizada sem foto do comprovante.</Text>
          )}
          {viagem.observacao_motorista ? <Text style={styles.obs}>“{viagem.observacao_motorista}”</Text> : null}
        </Card>
      )}

      <SecondaryButton title="Voltar para as viagens" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rotulo: { color: colors.textMuted, fontSize: 13 },
  valor: { color: colors.text, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: spacing.md },
  secao: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: spacing.sm },
  dica: { color: colors.textMuted, fontSize: 13 },
  foto: { width: '100%', height: 220, borderRadius: radius.md, marginTop: spacing.xs, backgroundColor: colors.surfaceAlt },
  botoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  obs: { color: colors.text, fontStyle: 'italic', marginTop: spacing.sm },
  pendente: { color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: spacing.xs },
});
