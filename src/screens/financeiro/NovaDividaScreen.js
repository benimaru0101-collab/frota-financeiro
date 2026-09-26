import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';

function formatarValor(texto) {
  const limpo = texto.trim();
  if (!limpo) return limpo;
  return limpo.startsWith('R$') ? limpo : `R$ ${limpo}`;
}

export default function NovaDividaScreen({ navigation }) {
  const { criarDividaComParcelas, categorias, veiculos } = useData();
  const [descricao, setDescricao] = useState('');
  const [credor, setCredor] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [numParcelas, setNumParcelas] = useState('');
  const [taxaJuros, setTaxaJuros] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [categoriaNome, setCategoriaNome] = useState('');
  const [placa, setPlaca] = useState('');
  const [salvando, setSalvando] = useState(false);

  const categoriasDespesa = categorias.filter((c) => c.tipo === 'despesa');

  async function handleSalvar() {
    if (!descricao.trim() || !valorTotal.trim() || !numParcelas.trim() || !dataInicio.trim()) {
      Alert.alert('Preencha descrição, valor total, número de parcelas e data de início');
      return;
    }
    const parcelasNum = parseInt(numParcelas, 10);
    if (!Number.isInteger(parcelasNum) || parcelasNum < 1 || parcelasNum > 360) {
      Alert.alert('Número de parcelas inválido', 'Use um número inteiro entre 1 e 360.');
      return;
    }
    setSalvando(true);
    const categoriaEncontrada = categoriasDespesa.find((c) => c.nome === categoriaNome);
    const veiculoEncontrado = veiculos.find((v) => v.placa === placa);
    const id = await criarDividaComParcelas({
      descricao: descricao.trim(),
      credor: credor.trim(),
      valorTotal: formatarValor(valorTotal),
      numParcelas: parcelasNum,
      taxaJuros,
      dataInicio: dataInicio.trim(),
      categoriaId: categoriaEncontrada?.id ?? null,
      veiculoId: veiculoEncontrado?.id ?? null,
    });
    setSalvando(false);
    if (id) {
      navigation.goBack();
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Nova Dívida / Financiamento</Title>
        <Subtitle>As parcelas são criadas automaticamente como despesas "Pendente"</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Descrição</Label>
        <Input placeholder="Ex.: Financiamento do caminhão XYZ" value={descricao} onChangeText={setDescricao} />
        <Label>Credor (opcional)</Label>
        <Input placeholder="Ex.: Banco XPTO" value={credor} onChangeText={setCredor} />
        <Label>Valor Total</Label>
        <Input placeholder="0,00" keyboardType="decimal-pad" value={valorTotal} onChangeText={setValorTotal} />
        <Label>Número de Parcelas</Label>
        <Input placeholder="Ex.: 12" keyboardType="number-pad" value={numParcelas} onChangeText={setNumParcelas} />
        <Label>Taxa de Juros % a.m. (opcional)</Label>
        <Input placeholder="Ex.: 1,5" keyboardType="decimal-pad" value={taxaJuros} onChangeText={setTaxaJuros} />
        <Label>Data de Início (1ª parcela)</Label>
        <Input placeholder="DD/MM/AAAA" value={dataInicio} onChangeText={setDataInicio} />

        {categoriasDespesa.length > 0 && (
          <>
            <Label>Categoria (opcional)</Label>
            <ChipSelect options={categoriasDespesa.map((c) => c.nome)} value={categoriaNome} onChange={setCategoriaNome} />
          </>
        )}
        {veiculos.length > 0 && (
          <>
            <Label>Veículo vinculado (opcional)</Label>
            <ChipSelect options={veiculos.map((v) => v.placa)} value={placa} onChange={setPlaca} />
          </>
        )}

        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: spacing.md, marginBottom: spacing.sm }}>
          Se algo falhar ao gerar as parcelas, nada é salvo — a operação é transacional (tudo ou nada).
        </Text>
        <PrimaryButton title="Gerar Dívida e Parcelas" onPress={handleSalvar} loading={salvando} />
      </View>
    </Screen>
  );
}
