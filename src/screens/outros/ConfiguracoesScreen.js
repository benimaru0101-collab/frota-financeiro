import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Screen, Card, Title, PrimaryButton } from '../../components/UI';
import { colors, spacing } from '../../theme/colors';

export default function ConfiguracoesScreen() {
  const [notificacoes, setNotificacoes] = useState(true);
  const [alertasManutencao, setAlertasManutencao] = useState(true);
  const [modoEscuro, setModoEscuro] = useState(true);

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

      <PrimaryButton title="Salvar Alterações" onPress={() => {}} style={{ marginTop: spacing.xl }} />
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
