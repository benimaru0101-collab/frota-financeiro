import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, Title, Subtitle, Label, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';
import { FILTROS_PADRAO, PERIODOS, TIPOS_RELATORIO } from '../../utils/relatorios';

export default function FiltrosRelatorioScreen({ route, navigation }) {
  const { categorias, contas } = useData();
  const filtrosAtuais = route?.params?.filtrosAtuais ?? FILTROS_PADRAO;
  const origem = route?.params?.origem ?? 'Relatorios';

  const [periodo, setPeriodo] = useState(filtrosAtuais.periodo);
  const [tipo, setTipo] = useState(filtrosAtuais.tipo);
  const [categoria, setCategoria] = useState(filtrosAtuais.categoria);
  const [conta, setConta] = useState(filtrosAtuais.conta);

  const categoriasDespesa = categorias.filter((c) => c.tipo === 'despesa');
  const opcoesCategoria = ['Todas', ...categoriasDespesa.map((c) => c.nome)];
  const opcoesConta = ['Todas as contas', ...contas.map((c) => c.nome)];

  function aplicar() {
    navigation.navigate(origem, { filtros: { periodo, tipo, categoria, conta } });
  }

  function limpar() {
    setPeriodo(FILTROS_PADRAO.periodo);
    setTipo(FILTROS_PADRAO.tipo);
    setCategoria(FILTROS_PADRAO.categoria);
    setConta(FILTROS_PADRAO.conta);
  }

  return (
    <Screen scroll>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Filtros do Relatório</Title>
        <Subtitle>Ajuste o período, tipo, categoria e conta</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Período</Label>
        <ChipSelect
          options={PERIODOS.map((p) => p.label)}
          value={PERIODOS.find((p) => p.valor === periodo)?.label}
          onChange={(label) => setPeriodo(PERIODOS.find((p) => p.label === label)?.valor ?? 'mes')}
        />

        <Label>Tipo</Label>
        <ChipSelect
          options={TIPOS_RELATORIO.map((t) => t.label)}
          value={TIPOS_RELATORIO.find((t) => t.valor === tipo)?.label}
          onChange={(label) => setTipo(TIPOS_RELATORIO.find((t) => t.label === label)?.valor ?? 'todos')}
        />

        {tipo !== 'receitas' && (
          <>
            <Label>Categoria</Label>
            <ChipSelect options={opcoesCategoria} value={categoria} onChange={setCategoria} />
          </>
        )}

        <Label>Conta</Label>
        <ChipSelect options={opcoesConta} value={conta} onChange={setConta} />
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: -spacing.sm, marginBottom: spacing.md }}>
          Lançamentos ainda não são vinculados a uma conta específica — este filtro fica pronto para quando isso existir.
        </Text>

        <PrimaryButton title="Aplicar Filtros" onPress={aplicar} />
        <SecondaryButton title="Limpar Filtros" onPress={limpar} style={{ marginTop: spacing.sm }} />
      </View>
    </Screen>
  );
}
