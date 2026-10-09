import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle, Input, PrimaryButton, ChipSelect, Label } from '../../components/UI';
import { useData, FORMAS_PAGAMENTO_PADRAO } from '../../contexts/DataContext';
import { colors, spacing, radius } from '../../theme/colors';

const ICONES = ['⚡', '🧾', '💳', '💵', '🏦', '📱'];

// Cadastro base de Formas de Pagamento (Pix, Boleto, Cartão...).
// As formas ATIVAS aparecem como opção nos formulários de Receita e
// Despesa. Não existe exclusão: a forma é desativada (soft delete),
// para não quebrar os lançamentos que já usaram aquela forma.
export default function FormasPagamentoScreen() {
  const { formasPagamento, addFormaPagamento, alternarFormaPagamentoAtiva } = useData();
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState(ICONES[0]);
  const [salvando, setSalvando] = useState(false);

  // Sem a migration-10 aplicada, mostra a lista padrão só para leitura.
  const semTabela = formasPagamento.length === 0;
  const lista = semTabela
    ? FORMAS_PAGAMENTO_PADRAO.map((n) => ({ id: n, nome: n, icone: '', ativa: true, padrao: true }))
    : formasPagamento;

  async function handleAdicionar() {
    const limpo = nome.trim();
    if (!limpo) {
      Alert.alert('Informe o nome da forma de pagamento');
      return;
    }
    if (formasPagamento.some((f) => f.nome.toLowerCase() === limpo.toLowerCase())) {
      Alert.alert('Essa forma de pagamento já existe', 'Se ela estiver inativa, toque nela para reativar.');
      return;
    }
    setSalvando(true);
    const ok = await addFormaPagamento({ nome: limpo, icone });
    setSalvando(false);
    if (ok) setNome('');
  }

  function alternar(item) {
    if (item.padrao) {
      Alert.alert('Lista padrão', 'Rode a migration-10 no Supabase para cadastrar e desativar formas de pagamento.');
      return;
    }
    const acao = item.ativa ? 'Desativar' : 'Reativar';
    const detalhe = item.ativa
      ? 'Ela deixa de aparecer nos formulários, mas os lançamentos antigos continuam com ela.'
      : 'Ela volta a aparecer nos formulários de receita e despesa.';
    Alert.alert(`${acao} "${item.nome}"?`, detalhe, [
      { text: 'Cancelar', style: 'cancel' },
      { text: acao, onPress: () => alternarFormaPagamentoAtiva(item.id, !item.ativa) },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Formas de Pagamento</Title>
        <Subtitle>Toque em uma forma para ativar ou desativar</Subtitle>
      </View>

      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        style={{ marginTop: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => alternar(item)}>
            <Card style={[styles.item, !item.ativa && styles.itemInativo]}>
              <Text style={styles.icone}>{item.icone || '💲'}</Text>
              <Text style={styles.nome}>{item.nome}</Text>
              <View style={[styles.selo, { borderColor: item.ativa ? colors.success : colors.textMuted }]}>
                <Text style={[styles.seloTexto, { color: item.ativa ? colors.success : colors.textMuted }]}>
                  {item.ativa ? 'Ativa' : 'Inativa'}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          semTabela ? null : (
            <View style={{ marginTop: spacing.xl, paddingBottom: spacing.xl }}>
              <Label>Nova forma de pagamento</Label>
              <Input placeholder="Ex.: Vale-transporte, Cheque" value={nome} onChangeText={setNome} />
              <Label>Ícone</Label>
              <ChipSelect options={ICONES} value={icone} onChange={setIcone} />
              <PrimaryButton title="Adicionar" onPress={handleAdicionar} loading={salvando} />
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  itemInativo: { opacity: 0.5 },
  icone: { fontSize: 20, width: 32 },
  nome: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  selo: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  seloTexto: { fontSize: 12, fontWeight: '700' },
});
