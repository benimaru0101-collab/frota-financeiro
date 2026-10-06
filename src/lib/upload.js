import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

// Funções de apoio para o "Upload de documentos": deixam o usuário
// escolher uma foto (galeria ou câmera) e enviam pro bucket público
// "documentos" no Supabase Storage, devolvendo a URL pública que é
// salva em `documentos.arquivo_url`.

export async function escolherDaGaleria() {
  const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissao.granted) {
    return { cancelado: true, semPermissao: true };
  }
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.6,
    allowsEditing: false,
  });
  if (resultado.canceled) return { cancelado: true };
  return { cancelado: false, asset: resultado.assets[0] };
}

export async function tirarFoto() {
  const permissao = await ImagePicker.requestCameraPermissionsAsync();
  if (!permissao.granted) {
    return { cancelado: true, semPermissao: true };
  }
  const resultado = await ImagePicker.launchCameraAsync({ quality: 0.6 });
  if (resultado.canceled) return { cancelado: true };
  return { cancelado: false, asset: resultado.assets[0] };
}

// Lê o arquivo escolhido, envia pro Storage e devolve a URL pública.
export async function enviarArquivoDocumento(asset) {
  // No navegador o expo-file-system não lê arquivos: o asset.uri é uma
  // URL blob:/data:, então basta buscá-la e enviar o binário direto.
  const corpo = Platform.OS === 'web'
    ? await (await fetch(asset.uri)).arrayBuffer()
    : decode(
        await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        })
      );
  const ehUrlTemporaria = /^(blob|data):/.test(asset.uri);
  const extensao = ehUrlTemporaria
    ? (asset.mimeType?.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
    : (asset.uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;
  const contentType = asset.mimeType || (extensao === 'png' ? 'image/png' : 'image/jpeg');

  const { error } = await supabase.storage
    .from('documentos')
    .upload(nomeArquivo, corpo, { contentType, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('documentos').getPublicUrl(nomeArquivo);
  return data.publicUrl;
}
