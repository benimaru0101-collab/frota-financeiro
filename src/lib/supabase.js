import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// As credenciais reais NUNCA devem ir no código-fonte versionado.
// Aqui lemos de app.json > expo.extra (que por sua vez deve ser
// alimentado a partir do seu .env em builds reais, ex: via eas.json
// ou variáveis de ambiente no CI). Veja .env.example.
const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig?.extra ?? {};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    // Persistir a sessão no dispositivo é o que garante que o usuário
    // continue logado depois de fechar e reabrir o app (Parte 2 - item 5
    // da atividade: "evidências da persistência da sessão").
    persistSession: true,
    // Na versão web/PWA o login do Google volta para a própria página com
    // ?code=... na URL; o Supabase precisa lê-la. No celular, não.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
