import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect, ColorSwatchSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing } from '../../theme/colors';

const TIPOS = [
  { label: 'Despesa', valor: 'despesa' },
  { label: 'Receita', valor: 'receita' },
];

export const ICONES = ['💰', '💸', '🚚', '⛽', '🔧', '🏠', '📱', '💳', '🍔', '📦', '🎯', '📄'];
export const CORES = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#F44336'];

export default function NovaCategoriaScreen({ navigation }) {
  const { addCategoria } = useData();
  const [nome, setNome] = useState('');
  const [tipoLabel, setTipoLabel] = useState(TIPOS[0].label);
  const [icone, setIcone] = useState(ICONES[0]);
  const [cor, setCor] = useState(CORES[0]);
  const [descricao, setDescricao] = useState('');

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Preencha o nome da categoria');
      return;
    }
    const tipo = TIPOS.find((t) => t.label === tipoLabel)?.valor ?? 'despesa';
    addCategoria({ nome: nome.trim(), tipo, icone, cor, descricao: descricao.trim() });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Nova Categoria</Title>
        <Subtitle>Categorias organizam receitas e despesas</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Tipo</Label>
        <ChipSelect options={TIPOS.map((t) => t.label)} value={tipoLabel} onChange={setTipoLabel} />
        <Label>Nome da categoria</Label>
        <Input placeholder="Ex.: Combustível, Pedágio" value={nome} onChangeText={setNome} />
        <Label>Ícone</Label>
        <ChipSelect options={ICONES} value={icone} onChange={setIcone} />
        <Label>Cor</Label>
        <ColorSwatchSelect options={CORES} value={cor} onChange={setCor} />
        <Label>Descrição (opcional)</Label>
        <Input placeholder="Observações sobre a categoria" value={descricao} onChangeText={setDescricao} />
        <PrimaryButton title="Salvar Categoria" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}
