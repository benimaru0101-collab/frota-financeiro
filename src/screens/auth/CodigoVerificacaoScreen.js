import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Screen, Title, Subtitle, PrimaryButton } from '../../components/UI';
import { colors, spacing, radius } from '../../theme/colors';

export default function CodigoVerificacaoScreen({ navigation }) {
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  function handleChange(text, index) {
    const novo = [...codigo];
    novo[index] = text;
    setCodigo(novo);
    if (text && index < 5) inputs.current[index + 1]?.focus();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.xl }}>
        <Title>Verificação</Title>
        <Subtitle>Digite o código enviado para seu e-mail</Subtitle>
      </View>

      <View style={styles.codeRow}>
        {codigo.map((digito, i) => (
          <TextInput
            key={i}
            ref={(ref) => (inputs.current[i] = ref)}
            value={digito}
            onChangeText={(t) => handleChange(t, i)}
            style={styles.codeBox}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            placeholderTextColor={colors.textMuted}
          />
        ))}
      </View>

      <PrimaryButton title="Verificar" onPress={() => navigation.navigate('NovaSenha')} style={{ marginTop: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  codeBox: {
    width: 44, height: 52, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 20,
  },
});
