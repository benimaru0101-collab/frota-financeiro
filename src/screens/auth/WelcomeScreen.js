import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, PrimaryButton, SecondaryButton } from '../../components/UI';
import { colors, spacing } from '../../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🚛</Text>
      </View>
      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>
        Gerencie sua frota e finanças em um só lugar, de forma simples e eficiente.
      </Text>
      <View style={{ marginTop: spacing.xl }}>
        <PrimaryButton title="Entrar" onPress={() => navigation.navigate('Login')} />
        <SecondaryButton
          title="Cadastrar"
          onPress={() => navigation.navigate('Cadastro')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 220, borderRadius: 16, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, marginBottom: spacing.xl,
  },
  heroIcon: { fontSize: 64 },
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.sm, lineHeight: 20 },
});
