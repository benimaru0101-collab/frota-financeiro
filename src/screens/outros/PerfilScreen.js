import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Card, Title, SecondaryButton } from '../../components/UI';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../theme/colors';

export default function PerfilScreen({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.user_metadata?.full_name || user?.email || 'J').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Title style={{ marginTop: spacing.md }}>{user?.user_metadata?.full_name || 'Juliano Silva'}</Title>
        <Text style={styles.email}>{user?.email || 'usuario@email.com'}</Text>
      </View>

      <Card style={{ marginTop: spacing.xl }}>
        <SecondaryButton title="Editar Perfil" onPress={() => navigation.navigate('EditarPerfil')} style={{ marginBottom: spacing.sm }} />
        <SecondaryButton title="Segurança" onPress={() => navigation.navigate('AlterarSenha')} style={{ marginBottom: spacing.sm }} />
        <SecondaryButton title="Configurações" onPress={() => navigation.navigate('Configuracoes')} style={{ marginBottom: spacing.sm }} />
        <SecondaryButton title="Sair da conta" onPress={signOut} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#1A1A1A', fontSize: 32, fontWeight: '700' },
  email: { color: colors.textMuted, marginTop: spacing.xs },
});
