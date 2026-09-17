import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, Card, Title, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { reagendarNotificacoesVencimento, cancelarNotificacoesVencimento } from '../../lib/notifications';
import { colors, spacing } from '../../theme/colors';

const STORAGE_KEY = '@frota_financeiro/preferencias_v1';

const PADRAO = {
  notificacoes: true,
  alertasManutencao: true,
  modoEscuro: true,
};

export default function ConfiguracoesScreen() {
  const { documentos } = useData();
  const [notificacoes, setNotificacoes] = useState(PADRAO.notificacoes);
  const [alertasManutencao, setAlertasManutencao] = useState(PADRAO.alertasManutencao);
  const [modoEscuro, setModoEscuro] = useState(PADRAO.modoEscuro);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo) {
          const prefs = JSON.parse(salvo);
          setNotificacoes(prefs.notificacoes ?? PADRAO.notificacoes);
          setAlertasManutencao(prefs.alertasManutencao ?? PADRAO.alertasManutencao);
          setModoEscuro(prefs.modoEscuro ?? PADRAO.modoEscuro);
        }
      } catch (erro) {
        console.warn('Não foi possível carregar as preferências:', erro);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  async function handleSalvar() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ notificacoes, alertasManutencao, modoEscuro })
      );
      if (notificacoes) {
        await reagendarNotificacoesVencimento(documentos);
      } else {
        await cancelarNotificacoesVencimento();
      }
      Alert.alert('Preferências salvas');
    } catch (erro) {
      Alert.alert('Não foi possível salvar as preferências', String(erro));
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
        <Title>Configurações</Title>
      </View>

      <Card>
        <ToggleRow label="Notificações" value={notificacoes} onChange={setNotificacoes} />
        <ToggleRow label="Alertas de Manutenção" value={alertasManutencao} onChange={setAlertasManutencao} />
        <ToggleRow label="Modo Escuro" value={modoEscuro} onChange={setModoEscuro} />
      </Card>

      <View style={{ marginTop: spacing.md }}>
        <Text style={styles.info}>Idioma: Português (BR)</Text>
      </View>

      <PrimaryButton
        title="Salvar Alterações"
        onPress={handleSalvar}
        disabled={carregando}
        style={{ marginTop: spacing.xl }}
      />
    </Screen>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  label: { color: colors.text, fontSize: 15 },
  info: { color: colors.textMuted, fontSize: 13 },
});
