import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = () => {
  if (typeof window !== 'undefined' && (window as any).ENV?.VITE_SUPABASE_URL) {
    return (window as any).ENV.VITE_SUPABASE_URL;
  }
  return import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
};

const getSupabaseAnonKey = () => {
  if (typeof window !== 'undefined' && (window as any).ENV?.VITE_SUPABASE_ANON_KEY) {
    return (window as any).ENV.VITE_SUPABASE_ANON_KEY;
  }
  return import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_KEY || '';
};

const validateUrl = (url: any): string => {
  if (!url) return '';
  const str = String(url).trim();
  if (str === 'undefined' || str === 'null' || str === '[object Object]' || str === '') return '';
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }
  return '';
};

const validateKey = (key: any): string => {
  if (!key) return '';
  const str = String(key).trim();
  if (str === 'undefined' || str === 'null' || str === '[object Object]' || str === '' || str.length < 10) return '';
  return str;
};

const rawUrl = getSupabaseUrl();
const rawKey = getSupabaseAnonKey();

const cleanUrl = validateUrl(rawUrl);
const cleanKey = validateKey(rawKey);

// Default fallbacks to prevent white screen of death
const DEFAULT_URL = 'https://ftqyzxrvghfdspgjampd.supabase.co';
const DEFAULT_KEY = 'sb_publishable_PRsJAks9Nw0fcT7Bvd0Y2Q_abzmKtne';

export const supabaseUrl = cleanUrl || DEFAULT_URL;
export const supabaseAnonKey = cleanKey || DEFAULT_KEY;

if (!cleanUrl) {
  console.warn(
    '【覓野茶】Supabase URL 尚未在 Vercel 或 AI Studio 中正確設定（讀取到的原始值為:', rawUrl, '），目前自動使用預設專案。' +
    '提醒：如果您剛在 Vercel 設定好環境變數，請務必重新部署（Redeploy）一次，新變數才會在打包時注入！'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  }
});

