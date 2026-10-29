import React, { useState } from 'react';
import { View, Text, Alert, Image, ActivityIndicator } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { escolherDaGaleria, tirarFoto, enviarArquivoDocumento } from '../../lib/upload';
import { spacing, colors, radius } from '../../theme/colors';

const TIPOS = ['Seguro', 'IPVA', 'Licenciamento', 'Outro'];

export default function NovoDocumentoScreen({ navigation }) {
  const { addDocumento, veiculos } = useData();
  const [placa, setPlaca] = useState(veiculos[0]?.placa ?? '');
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [vencimento, setVencimento] = useState('');
  const [preview, setPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [arquivoUrl, setArquivoUrl] = useState(null);

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
      setArquivoUrl(url);
    } catch (erro) {
      Alert.alert('Erro ao enviar o arquivo', erro?.message ?? 'Tente novamente.');
      setPreview(null);
    } finally {
      setEnviando(false);
    }
  }

  function handleSalvar() {
    if (!placa || !vencimento.trim()) {
      Alert.alert('Preencha o veículo e a data de vencimento');
      return;
    }
    if (enviando) {
      Alert.alert('Aguarde o envio do arquivo terminar');
      return;
    }
    addDocumento({ placa, tipo, vencimento: vencimento.trim(), arquivoUrl });
    navigation.goBack();
  }

  return (
    <Screen scroll>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Novo Documento</Title>
        <Subtitle>Registre um documento do veículo</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Veículo</Label>
        {veiculos.length > 0 ? (
          <ChipSelect options={veiculos.map((v) => v.placa)} value={placa} onChange={setPlaca} />
        ) : (
          <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>Cadastre um veículo primeiro.</Text>
        )}
        <Label>Tipo de documento</Label>
        <ChipSelect options={TIPOS} value={tipo} onChange={setTipo} />
        <Label>Vencimento</Label>
        <Input placeholder="DD/MM/AAAA" value={vencimento} onChangeText={setVencimento} />

        <Label>Arquivo (opcional)</Label>
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
            {!enviando && arquivoUrl && (
              <Text style={{ color: colors.success, marginTop: spacing.xs, fontSize: 12 }}>Arquivo anexado ✓</Text>
            )}
          </View>
        )}
        <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
          <SecondaryButton title="📷 Tirar foto" onPress={() => anexar('camera')} style={{ flex: 1, marginRight: spacing.sm }} />
          <SecondaryButton title="🖼️ Galeria" onPress={() => anexar('galeria')} style={{ flex: 1 }} />
        </View>

        <PrimaryButton title="Salvar Documento" onPress={handleSalvar} loading={enviando} />
      </View>
    </Screen>
  );
}
