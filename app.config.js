// Junta o app.json (versionado, sem segredos) com as credenciais do
// arquivo .env (NAO versionado). O Expo carrega o .env automaticamente
// ao rodar `expo start`, `expo prebuild` e no build do APK, entao as
// chaves reais nunca precisam ir pro GitHub.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    supabaseUrl: process.env.SUPABASE_URL || config.extra?.supabaseUrl,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || config.extra?.supabaseAnonKey,
  },
});
