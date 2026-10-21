import React, { useState } from 'react';
import { View, Text, Image, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Label, Input, PrimaryButton, SecondaryButton } from '../../components/UI';
import { useMotorista } from '../../contexts/MotoristaContext';
import { STATUS, dataBR, horaBR, iniciarViagem, finalizarViagem } from '../../lib/motorista';
import { escolherDaGaleria, tirarFoto, enviarArquivoDocumento } from '../../lib/upload';
import StatusViagem from './StatusViagem';
import { colors, spacing, radius } from '../../theme/colors';

export default function ViagemMotoristaScreen({ route, navigation }) {
  const { viagens, substituirViagem } = useMotorista();
  const viagem = viagens.find((v) => v.id === route.params?.id);
  const [salvando, setSalvando] = useState(false);
  const [foto, setFoto] = useState(null);
  const [observacao, setObservacao] = useState('');

  if (!viagem) {
    return (
      <Screen>
        <Text style={{ color: colors.textMuted, marginTop: spacing.xl }}>Viagem não encontrada.</Text>
        <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </Screen>
    );
  }

  async function handleIniciar() {
    setSalvando(true);
    try {
      substituirViagem(await iniciarViagem(viagem.id));
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
      const comprovanteUrl = foto ? await enviarArquivoDocumento(foto) : null;
      substituirViagem(await finalizarViagem(viagem.id, { comprovanteUrl, observacao }));
      Alert.alert('Entrega finalizada', 'Bom trabalho! A viagem foi registrada como concluída.');
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
        <Title style={{ marginTop: spacing.sm }}>{viagem.origem} → {viagem.destino}</Title>
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Linha rotulo="Data" valor={dataBR(viagem.data_viagem)} />
        <Linha rotulo="Veículo" valor={viagem.veiculos ? `${viagem.veiculos.placa} · ${viagem.veiculos.modelo}` : '—'} />
        {viagem.iniciada_em && <Linha rotulo="Iniciada" valor={horaBR(viagem.iniciada_em)} />}
        {viagem.finalizada_em && <Linha rotulo="Finalizada" valor={horaBR(viagem.finalizada_em)} />}
      </Card>

      {viagem.status === STATUS.AGENDADA && (
        <PrimaryButton title="▶  Iniciar viagem" onPress={handleIniciar} loading={salvando} style={{ marginTop: spacing.lg }} />
      )}

      {viagem.status === STATUS.EM_ANDAMENTO && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.secao}>Comprovante de entrega</Text>
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
});
