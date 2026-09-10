import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../../theme/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Welcome'), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoIcon}>🚚</Text>
      </View>
      <Text style={styles.title}>Financeiro e Frota{'\n'}Logística</Text>
      <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      <Text style={styles.loading}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 72, height: 72, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  logoIcon: { fontSize: 32 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  loading: { color: colors.textMuted, marginTop: spacing.sm, fontSize: 12 },
});
