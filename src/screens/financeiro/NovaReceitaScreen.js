import React, { useState } from 'react';
import { View, Text, Alert, Image, ActivityIndicator } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { escolherDaGaleria, tirarFoto, enviarArquivoDocumento } from '../../lib/upload';
import { spacing, colors, radius } from '../../theme/colors';

const STATUS_OPCOES = ['Recebido', 'Pendente'];
const FORMAS_PAGAMENTO = ['Pix', 'Boleto', 'Cartão', 'Dinheiro', 'Transferência'];

function formatarValor(texto) {
  const limpo = texto.trim();
  if (!limpo) return limpo;
  return limpo.startsWith('R$') ? limpo : `R$ ${limpo}`;
}

export default function NovaReceitaScreen({ navigation }) {
  const { addReceita } = useData();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [statusLabel, setStatusLabel] = useState(STATUS_OPCOES[0]);
  const [formaPagamento, setFormaPagamento] = useState(FORMAS_PAGAMENTO[0]);
  const [dataPagamento, setDataPagamento] = useState('');
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [comprovanteUrl, setComprovanteUrl] = useState(null);

  const pendente = statusLabel === 'Pendente';

  async function anexar(origem) {
    const resultado = origem === 'camera' ? await tirarFoto() : await escolherDaGaleria();
    if (resultado.semPermissao) {
      Alert.alert('Precisamos de permissão para acessar isso no seu aparelho.');
      return;
    }
    if (resultado.cancelado || !resultado.asset) return;

    setPreview(resultado.asset.uri);
    setEnviando(true);
    try {
      const url = await enviarArquivoDocumento(resultado.asset);
      setComprovanteUrl(url);
    } catch (erro) {
      Alert.alert('Erro ao enviar o comprovante', erro?.message ?? 'Tente novamente.');
      setPreview(null);
    } finally {
      setEnviando(false);
    }
  }

  function handleSalvar() {
    if (!descricao.trim() || !valor.trim()) {
      Alert.alert('Preencha a descrição e o valor');
      return;
    }
    if (parseFloat(valor.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')) <= 0) {
      Alert.alert('O valor precisa ser maior que zero');
      return;
    }
    if (enviando) {
      Alert.alert('Aguarde o envio do comprovante terminar');
      return;
    }
    addReceita({
      descricao: descricao.trim(),
      valor: formatarValor(valor),
      data: data.trim() || new Date().toLocaleDateString('pt-BR'),
      status: pendente ? 'pendente' : 'concluido',
      dataPagamento: pendente ? '' : (dataPagamento.trim() || data.trim()),
      formaPagamento: pendente ? '' : formaPagamento,
      comprovanteUrl,
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Nova Receita</Title>
        <Subtitle>Registre uma nova entrada financeira</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Descrição</Label>
        <Input placeholder="Ex.: Frota - Transporte X" value={descricao} onChangeText={setDescricao} />
        <Label>Valor</Label>
        <Input placeholder="0,00" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
        <Label>Data</Label>
        <Input placeholder="DD/MM/AAAA" value={data} onChangeText={setData} />

        <Label>Status</Label>
        <ChipSelect options={STATUS_OPCOES} value={statusLabel} onChange={setStatusLabel} />

        {!pendente && (
          <>
            <Label>Forma de Pagamento</Label>
            <ChipSelect options={FORMAS_PAGAMENTO} value={formaPagamento} onChange={setFormaPagamento} />
            <Label>Data do Recebimento</Label>
            <Input placeholder="DD/MM/AAAA (padrão: mesma data acima)" value={dataPagamento} onChangeText={setDataPagamento} />

            <Label>Comprovante (opcional)</Label>
            {preview && (
              <View style={{ marginBottom: spacing.md }}>
                <Image
                  source={{ uri: preview }}
                  style={{ width: 96, height: 96, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border }}
                />
                {enviando && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.textMuted, marginLeft: spacing.xs, fontSize: 12 }}>Enviando...</Text>
                  </View>
                )}
                {!enviando && comprovanteUrl && (
                  <Text style={{ color: colors.success, marginTop: spacing.xs, fontSize: 12 }}>Comprovante anexado ✓</Text>
                )}
              </View>
            )}
            <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
              <SecondaryButton title="📷 Tirar foto" onPress={() => anexar('camera')} style={{ flex: 1, marginRight: spacing.sm }} />
              <SecondaryButton title="🖼️ Galeria" onPress={() => anexar('galeria')} style={{ flex: 1 }} />
            </View>
          </>
        )}

        <PrimaryButton title="Salvar Receita" onPress={handleSalvar} loading={enviando} />
      </View>
    </Screen>
  );
}
