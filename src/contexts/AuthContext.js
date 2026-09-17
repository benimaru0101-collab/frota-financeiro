import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

// Lê os parâmetros (?code=... ou #access_token=...) da URL de retorno
// do login. Substitui AuthSession.QueryParams.getQueryParams, que foi
// removido em versões mais novas do expo-auth-session.
function extrairParametrosDaUrl(url) {
  const indiceQuery = url.indexOf('?');
  const indiceFragmento = url.indexOf('#');
  let inicio = -1;
  if (indiceQuery !== -1) inicio = indiceQuery;
  else if (indiceFragmento !== -1) inicio = indiceFragmento;
  if (inicio === -1) return {};

  const trecho = url.slice(inicio + 1);
  const params = {};
  new URLSearchParams(trecho).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao abrir o app, o Supabase tenta restaurar a sessão salva
    // localmente (AsyncStorage). É essa checagem que comprova a
    // persistência de sessão pedida na atividade.
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch((error) => {
        // Evita ficar travado na tela de loading para sempre caso a
        // checagem de sessão falhe (ex: sem internet, credenciais
        // erradas no app.json/.env).
        console.warn('Erro ao restaurar sessão:', error?.message);
        setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fluxo OAuth2 NATIVO do Google (Authorization Code + PKCE via
  // expo-auth-session), conforme pedido na atividade — nada de
  // formulário manual pedindo email/senha do Google.
  async function signInWithGoogle() {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'frotafinanceiro',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

    if (result.type === 'success' && result.url) {
      const params = extrairParametrosDaUrl(result.url);
      if (params.error) throw new Error(params.error_description || params.error);

      if (params.code) {
        // Fluxo padrão do supabase-js v2 (PKCE): a URL de volta traz
        // ?code=..., que precisa ser trocado por uma sessão.
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(params.code);
        if (sessionError) throw sessionError;
        setSession(sessionData.session);
      } else if (params.access_token && params.refresh_token) {
        // Fallback para fluxo implícito (caso o projeto use flowType diferente).
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (sessionError) throw sessionError;
        setSession(sessionData.session);
      }
    }

    return result;
  }

  async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
    return data;
  }

  async function signUpWithEmail(email, password, nome) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nome } },
    });
    if (error) throw error;
    return data;
  }

  async function sendPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}