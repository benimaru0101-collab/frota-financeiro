import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { colors, spacing, radius } from '../theme/colors';

// `scroll`: formulários longos (ex.: com prévia do comprovante) passam a
// rolar, para o botão Salvar nunca ficar escondido atrás da barra de abas.
export function Screen({ children, style, scroll = false }) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'bottom']}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children, style }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Subtitle({ children, style }) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>;
}

export function Label({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Input(props) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[styles.input, props.style]}
      {...props}
    />
  );
}

export function PrimaryButton({ title, onPress, loading, disabled, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.primaryButton, (disabled || loading) && { opacity: 0.6 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <Text style={styles.primaryButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.secondaryButton, style]}>
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function GoogleButton({ title = 'Entrar com Google', onPress, loading }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={styles.googleButton}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={styles.googleButtonText}>G  {title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function ChipSelect({ options, value, onChange }) {
  return (
    <View style={styles.chipSelectRow}>
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chipOption, selected && styles.chipOptionSelected]}
          >
            <Text style={[styles.chipOptionText, selected && styles.chipOptionTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function FilterTabs({ options, value, onChange }) {
  return (
    <View style={styles.filterTabsRow}>
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.filterTab, selected && styles.filterTabSelected]}
          >
            <Text style={[styles.filterTabText, selected && styles.filterTabTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function ColorSwatchSelect({ options, value, onChange }) {
  return (
    <View style={styles.swatchRow}>
      {options.map((cor) => {
        const selected = cor === value;
        return (
          <TouchableOpacity
            key={cor}
            onPress={() => onChange(cor)}
            style={[styles.swatch, { backgroundColor: cor }, selected && styles.swatchSelected]}
          />
        );
      })}
    </View>
  );
}

export function IconButton({ icon = '+', onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.iconButton, style]}>
      <Text style={styles.iconButtonText}>{icon}</Text>
    </TouchableOpacity>
  );
}

// Gráfico de rosca (donut) sem biblioteca de charts: cada fatia é um
// círculo de raio igual com stroke-dasharray proporcional ao seu
// percentual, empilhados uns sobre os outros. `segments` é uma lista
// de { percentual, cor }.
export function DonutChart({ segments, size = 150, strokeWidth = 24 }) {
  const center = size / 2;
  const raio = center - strokeWidth / 2;
  const circunferencia = 2 * Math.PI * raio;
  let acumulado = 0;

  return (
    <Svg width={size} height={size}>
      <Circle cx={center} cy={center} r={raio} stroke={colors.surfaceAlt} strokeWidth={strokeWidth} fill="none" />
      {segments.map((seg, i) => {
        const comprimento = Math.max((seg.percentual / 100) * circunferencia - 2, 0);
        const offset = -((acumulado / 100) * circunferencia);
        acumulado += seg.percentual;
        return (
          <Circle
            key={i}
            cx={center}
            cy={center}
            r={raio}
            stroke={seg.cor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${comprimento} ${circunferencia - comprimento}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        );
      })}
    </Svg>
  );
}

// Gráfico de linhas simples (sem biblioteca de charts): recebe até
// duas séries numéricas do mesmo tamanho e desenha uma polyline para
// cada uma, escalando pelo maior valor entre as duas.
export function LineChart({ series, count, height = 130, columnWidth = 56 }) {
  const width = Math.max(count * columnWidth, columnWidth);
  const maximo = Math.max(1, ...series.flatMap((s) => s.dados));
  const pontoX = (i) => i * columnWidth + columnWidth / 2;
  const pontoY = (v) => height - (v / maximo) * (height - 12) - 4;

  return (
    <Svg width={width} height={height}>
      {series.map((s, si) => {
        const pontos = s.dados.map((v, i) => `${pontoX(i)},${pontoY(v)}`).join(' ');
        return (
          <React.Fragment key={si}>
            <Polyline points={pontos} fill="none" stroke={s.cor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {s.dados.map((v, i) => (
              <Circle key={i} cx={pontoX(i)} cy={pontoY(v)} r={3.5} fill={s.cor} />
            ))}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export function StatPill({ label, value, positive }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillLabel}>{label}</Text>
      <Text style={[styles.statPillValue, { color: positive ? colors.success : colors.danger }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  googleButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  statPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  statPillLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statPillValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  chipSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  chipOption: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipOptionText: {
    color: colors.text,
    fontSize: 12,
  },
  chipOptionTextSelected: {
    color: colors.darkText,
    fontWeight: '700',
  },
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginTop: spacing.md,
  },
  filterTab: {
    flex: 1,
    borderRadius: radius.sm - 2,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterTabSelected: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTabTextSelected: {
    color: colors.darkText,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.text,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    color: colors.darkText,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
});
