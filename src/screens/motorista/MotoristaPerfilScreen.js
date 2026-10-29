import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Card, Title, SecondaryButton } from '../../components/UI';
import { useAuth } from '../../contexts/AuthContext';
import { useMotorista } from '../../contexts/MotoristaContext';
import { colors, spacing, radius } from '../../theme/colors';

export default function MotoristaPerfilScreen() {
  const { user, signOut } = useAuth();
  const { cadastro } = useMotorista();

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Meu perfil</Title>
      </View>
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.pill}>
          <Text style={styles.pillTexto}>Motorista</Text>
        </View>
        <Text style={styles.nome}>{cadastro?.nome ?? user?.user_metadata?.full_name ?? 'Motorista'}</Text>
        <Text style={styles.info}>{user?.email}</Text>
        {cadastro?.cnh ? <Text style={styles.info}>{cadastro.cnh}</Text> : null}
        {!cadastro && <Text style={[styles.info, { color: colors.danger }]}>Conta ainda não vinculada a um cadastro de motorista.</Text>}
      </Card>
      <SecondaryButton title="Sair da conta" onPress={signOut} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pill: { backgroundColor: colors.info, alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  pillTexto: { color: colors.darkText, fontSize: 11, fontWeight: '700' },
  nome: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: spacing.sm },
  info: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
});
