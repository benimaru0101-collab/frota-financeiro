// Paleta baseada no protótipo de baixa fidelidade do app.
// Tema escuro, minimalista, com um único acento em amarelo para
// ações primárias — mantém contraste alto e reduz ruído visual.
export const colors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#242424',
  border: '#2C2C2C',
  primary: '#FFC107',
  primaryDark: '#E5A800',
  text: '#FFFFFF',
  darkText: '#1A1A1A',
  textMuted: '#B0B0B0', // cinza com contraste AA sobre os cartões
  success: '#4CAF50',
  danger: '#FF6B6B', // vermelho mais claro: contraste >= 4,5:1 sobre o fundo escuro (WCAG AA)
  info: '#2196F3',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};
