import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect, ColorSwatchSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';
import { ICONES, CORES } from './NovaCategoriaScreen';

const TIPOS = [
  { label: 'Despesa', valor: 'despesa' },
  { label: 'Receita', valor: 'receita' },
];

export default function EditarCategoriaScreen({ route, navigation }) {
  const { updateCategoria, deleteCategoria } = useData();
  const categoria = route?.params?.categoria;

  const [nome, setNome] = useState(categoria?.nome ?? '');
  const [tipoLabel, setTipoLabel] = useState(
    TIPOS.find((t) => t.valor === categoria?.tipo)?.label ?? TIPOS[0].label
  );
  const [icone, setIcone] = useState(categoria?.icone || ICONES[0]);
  const [cor, setCor] = useState(categoria?.cor || CORES[0]);
  const [descricao, setDescricao] = useState(categoria?.descricao ?? '');

  if (!categoria) {
    return (
      <Screen>
        <View style={{ marginTop: spacing.xl }}>
          <Title>Categoria não encontrada</Title>
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Preencha o nome da categoria');
      return;
    }
    const tipo = TIPOS.find((t) => t.label === tipoLabel)?.valor ?? 'despesa';
    updateCategoria(categoria.id, { nome: nome.trim(), tipo, icone, cor, descricao: descricao.trim() });
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert('Excluir categoria', `Tem certeza que deseja excluir "${categoria.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteCategoria(categoria.id);
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Editar Categoria</Title>
        <Subtitle>Atualize os dados da categoria</Subtitle>
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

        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} />
        <SecondaryButton
          title="Excluir Categoria"
          onPress={handleExcluir}
          style={{ marginTop: spacing.sm, borderColor: colors.danger }}
        />
      </View>
    </Screen>
  );
}
