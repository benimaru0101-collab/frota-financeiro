import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle } from '../../components/UI';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { montarAlertas, contarPorSeveridade } from '../../utils/alertas';
import { colors, spacing } from '../../theme/colors';

const COR = { critico: colors.danger, atencao: colors.primary, info: colors.info };
const ROTULO = { critico: 'Crítico', atencao: 'Atenção', info: 'Aviso' };
const ICONE = { documento: '📄', despesa: '💸', receita: '💵' };

export default function AlertasScreen({ navigation }) {
  const { isAdmin } = useAuth();
  const { documentos, receitas, despesas } = useData();

  const alertas = useMemo(
    () => montarAlertas({ documentos, receitas, despesas }, { podeVerFinanceiro: isAdmin }),
    [documentos, receitas, despesas, isAdmin]
  );
  const contagem = contarPorSeveridade(alertas);

  function abrir(alerta) {
    navigation.navigate(alerta.destino.aba, { screen: alerta.destino.tela });
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ marginTop: spacing.lg }}>
          <Title>Alertas</Title>
          <Subtitle>
            {alertas.length === 0
              ? 'Tudo em dia por aqui.'
              : `${contagem.critico} crítico(s) · ${contagem.atencao} de atenção · ${contagem.info} aviso(s)`}
          </Subtitle>
        </View>

        {alertas.length === 0 ? (
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={styles.vazio}>Nenhum documento vencendo e nenhuma conta atrasada. ✅</Text>
          </Card>
        ) : (
          alertas.map((a) => (
            <TouchableOpacity key={a.id} onPress={() => abrir(a)} activeOpacity={0.8}>
              <Card style={styles.card}>
                <Text style={styles.icone}>{ICONE[a.tipo]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.titulo}>{a.titulo}</Text>
                  <Text style={styles.detalhe}>{a.detalhe}</Text>
                </View>
                <View style={[styles.selo, { borderColor: COR[a.severidade] }]}>
                  <Text style={[styles.seloTexto, { color: COR[a.severidade] }]}>{ROTULO[a.severidade]}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.nota}>
          Documentos aparecem 30 dias antes do vencimento; contas pendentes, 7 dias antes (ou depois de atrasadas).
          {isAdmin ? '' : ' Alertas financeiros ficam visíveis só para administradores.'}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center' },
  icone: { fontSize: 22, marginRight: spacing.md },
  titulo: { color: colors.text, fontSize: 14, fontWeight: '600' },
  detalhe: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  selo: { borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 2, marginLeft: spacing.sm },
  seloTexto: { fontSize: 11, fontWeight: '700' },
  vazio: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  nota: { color: colors.textMuted, fontSize: 11, marginTop: spacing.lg },
});
