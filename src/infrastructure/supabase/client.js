import { createClient } from '@supabase/supabase-js';

// Centraliza a criação do cliente Supabase.
// Em Vite use import.meta.env.VITE_SUPABASE_*, em outros ambientes fallback para process.env.
const SUPABASE_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL
  ? import.meta.env.VITE_SUPABASE_URL
  : process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';

const SUPABASE_KEY = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
