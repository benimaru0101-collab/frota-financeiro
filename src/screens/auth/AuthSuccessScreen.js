import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/colors';

export default function AuthSuccessScreen({ navigation }) {
  useEffect(() => {
    // A navegação para o app principal acontece automaticamente:
    // o RootNavigator observa a sessão do Supabase (useAuth) e troca
    // de stack assim que `session` deixa de ser nula. Este timer é
    // só para o usuário ver a confirmação por um instante.
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.check}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      <Text style={styles.title}>Login realizado com sucesso!</Text>
      <Text style={styles.subtitle}>Redirecionando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  check: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  checkIcon: { fontSize: 40, color: '#fff' },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs },
});
