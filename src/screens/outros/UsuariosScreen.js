import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { Screen, Card, Title, Subtitle } from '../../components/UI';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, radius } from '../../theme/colors';

// Gestão de papéis (RBAC): só o administrador chega aqui (o botão só
// aparece no Perfil para quem é administrador) e o banco também só
// deixa administrador ler todos os perfis e trocar o papel
// (migration-9: policies + trigger proteger_role).
export default function UsuariosScreen() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, email, role')
      .order('nome', { ascending: true });
    setCarregando(false);
    if (error) {
      Alert.alert('Erro ao carregar usuários', error.message);
      return;
    }
    setUsuarios(data ?? []);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function trocarPapel(item) {
    const novo = item.role === 'motorista' ? 'administrador' : 'motorista';
    const rotulo = novo === 'administrador' ? 'Administrador' : 'Motorista';
    const ehVoce = item.id === user?.id;
    Alert.alert(
      'Alterar papel',
      `Mudar ${item.nome || item.email || 'este usuário'} para ${rotulo}?` +
        (ehVoce && novo === 'motorista' ? '\n\nAtenção: você perderá o acesso ao Financeiro.' : ''),
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Alterar',
          onPress: async () => {
            setSalvandoId(item.id);
            const { error } = await supabase.from('profiles').update({ role: novo }).eq('id', item.id);
            setSalvandoId(null);
            if (error) {
              Alert.alert('Não foi possível alterar', error.message);
              return;
            }
            setUsuarios((atual) => atual.map((u) => (u.id === item.id ? { ...u, role: novo } : u)));
            if (ehVoce) {
              Alert.alert('Papel alterado', 'Feche e abra o app para ver o menu do novo papel.');
            }
          },
        },
      ]
    );
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Usuários e Papéis</Title>
        <Subtitle>Toque em um usuário para alternar entre Administrador e Motorista</Subtitle>
      </View>
      {carregando && usuarios.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum usuário encontrado.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => trocarPapel(item)} disabled={salvandoId === item.id}>
              <Card style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nome}>
                    {item.nome || 'Sem nome'}{item.id === user?.id ? ' (você)' : ''}
                  </Text>
                  <Text style={styles.email}>{item.email || ''}</Text>
                </View>
                {salvandoId === item.id ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <View style={[styles.pill, { backgroundColor: item.role === 'motorista' ? colors.info : colors.primary }]}>
                    <Text style={styles.pillTexto}>{item.role === 'motorista' ? 'Motorista' : 'Administrador'}</Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center' },
  nome: { color: colors.text, fontSize: 15, fontWeight: '600' },
  email: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, marginLeft: spacing.sm },
  pillTexto: { color: colors.darkText, fontSize: 11, fontWeight: '700' },
  vazio: { color: colors.textMuted, marginTop: spacing.lg },
});
