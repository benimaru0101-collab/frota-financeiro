import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, Title } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function FinanceiroHomeScreen({ navigation }) {
  const { resumo, contas, categorias, dividas, nomesFormasPagamento } = useData();
  const categoriasAtivas = categorias.filter((c) => c.ativa !== false).length;
  return (
    <Screen>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
        <Title>Financeiro</Title>
      </View>

      <MenuItem
        label="Receitas"
        valor={resumo.receitasMes}
        cor={colors.success}
        onPress={() => navigation.navigate('Receitas')}
      />
      <MenuItem
        label="Despesas"
        valor={resumo.despesasMes}
        cor={colors.danger}
        onPress={() => navigation.navigate('Despesas')}
      />
      <MenuItem
        label="Fluxo de Caixa"
        valor="Ver gráfico"
        cor={colors.info}
        onPress={() => navigation.navigate('FluxoDeCaixa')}
      />
      <MenuItem
        label="Contas"
        valor={`${contas.length} conta${contas.length === 1 ? '' : 's'}`}
        cor={colors.text}
        onPress={() => navigation.navigate('Contas')}
      />
      <MenuItem
        label="Categorias"
        valor={`${categoriasAtivas} ativa${categoriasAtivas === 1 ? '' : 's'}`}
        cor={colors.text}
        onPress={() => navigation.navigate('Categorias')}
      />
      <MenuItem
        label="Formas de Pagamento"
        valor={`${nomesFormasPagamento.length} ativa${nomesFormasPagamento.length === 1 ? '' : 's'}`}
        cor={colors.text}
        onPress={() => navigation.navigate('FormasPagamento')}
      />
      <MenuItem
        label="Relatórios"
        valor="Ver relatórios"
        cor={colors.info}
        onPress={() => navigation.navigate('Relatorios')}
      />
      <MenuItem
        label="Dívidas e Financiamentos"
        valor={`${dividas.length} cadastrada${dividas.length === 1 ? '' : 's'}`}
        cor={colors.primary}
        onPress={() => navigation.navigate('Dividas')}
      />
    </Screen>
  );
}

function MenuItem({ label, valor, cor, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={{ marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.valor, { color: cor }]}>{valor}</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
  valor: { fontSize: 15, fontWeight: '700' },
});
