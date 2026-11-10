import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAtualizacao, abrirDownload, buscarAtualizacao, VERSAO_ATUAL } from '../lib/atualizacao';
import { colors, spacing, radius } from '../theme/colors';

// Aparece só quando existe uma versão mais nova publicada no GitHub.
export default function BannerAtualizacao() {
  const nova = useAtualizacao();
  const [fechado, setFechado] = useState(false);
  if (!nova || fechado) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="cloud-download-outline" size={22} color={colors.primary} />
      <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
        <Text style={styles.titulo}>Nova versão {nova.versao} disponível</Text>
        {nova.notas ? <Text style={styles.notas} numberOfLines={2}>{nova.notas}</Text> : null}
      </View>
      <TouchableOpacity
        style={styles.botao}
        onPress={() => abrirDownload(nova.url)}
        accessibilityRole="button"
        accessibilityLabel={`Atualizar para a versão ${nova.versao}`}
      >
        <Text style={styles.botaoTexto}>Atualizar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setFechado(true)}
        accessibilityRole="button"
        accessibilityLabel="Agora não"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{ marginLeft: spacing.sm }}
      >
        <Ionicons name="close" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, padding: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary,
  },
  titulo: { color: colors.text, fontSize: 14, fontWeight: '700' },
  notas: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  botao: {
    backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md,
    minHeight: 40, justifyContent: 'center',
  },
  botaoTexto: { color: colors.darkText, fontWeight: '700' },
});

// Linha "Versão do app" com botão para procurar atualização na hora.
export function VersaoApp() {
  const [estado, setEstado] = useState('parado');
  const [nova, setNova] = useState(null);

  async function verificar() {
    setEstado('buscando');
    try {
      const r = await buscarAtualizacao();
      setNova(r);
      setEstado(r ? 'tem' : 'atualizado');
    } catch {
      setEstado('erro');
    }
  }

  const textos = {
    parado: 'Verificar atualização',
    buscando: 'Procurando...',
    atualizado: 'Você está na versão mais recente',
    erro: 'Sem conexão. Tente de novo',
  };

  return (
    <View style={[styles.banner, { borderColor: colors.border }]}>
      <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
      <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
        <Text style={styles.titulo}>Versão do app {VERSAO_ATUAL}</Text>
        {estado !== 'tem' && estado !== 'parado' ? <Text style={styles.notas}>{textos[estado]}</Text> : null}
      </View>
      {estado === 'tem' ? (
        <TouchableOpacity
          style={styles.botao}
          onPress={() => abrirDownload(nova.url)}
          accessibilityRole="button"
          accessibilityLabel={`Atualizar para a versão ${nova.versao}`}
        >
          <Text style={styles.botaoTexto}>Atualizar para {nova.versao}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: colors.surfaceAlt }]}
          onPress={verificar}
          disabled={estado === 'buscando'}
          accessibilityRole="button"
          accessibilityLabel="Verificar atualização"
          accessibilityState={{ busy: estado === 'buscando' }}
        >
          <Text style={[styles.botaoTexto, { color: colors.text }]}>Verificar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
