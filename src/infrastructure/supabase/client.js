import { createClient } from '@supabase/supabase-js';

// Centraliza a criação do cliente Supabase.
// Em Vite use import.meta.env.VITE_SUPABASE_*, em outros ambientes fallback para process.env.
const SUPABASE_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL
  ? import.meta.env.VITE_SUPABASE_URL
  : process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';

const SUPABASE_KEY = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Debug para identificar problemas no Vercel (remover após corrigir)
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE CONFIG ERROR:', {
    url: SUPABASE_URL ? '✅ OK' : '❌ MISSING',
    key: SUPABASE_KEY ? '✅ OK' : '❌ MISSING',
    env_available: typeof import.meta !== 'undefined' ? 'Vite' : 'Node',
    vite_url: import.meta?.env?.VITE_SUPABASE_URL || 'undefined',
    vite_key: import.meta?.env?.VITE_SUPABASE_ANON_KEY ? 'present' : 'undefined'
  });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
