-- SQL para Debug da tabela backup_semestre e edge function
-- Execute no Supabase SQL Editor para diagnosticar o erro 400

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'backup_semestre'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.relname = 'backup_semestre';

-- 3. Verificar RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'backup_semestre';

-- 4. Testar INSERT manualmente (simular o que a Edge Function faz)
-- COMENTADO - descomente para testar
/*
INSERT INTO public.backup_semestre (
  semestre_label,
  gerado_em,
  arquivo_path,
  eventos_count,
  manifest_json
) VALUES (
  '2025-1',
  NOW(),
  'backups/2025-1/backup-2025-1.zip',
  0,
  '{"semestre_label":"2025-1","generated_at":"2025-11-08T00:00:00Z","tables":{"agenda_eventos":{"rows":0}}}'::jsonb
);
*/

-- 5. Verificar se a função get_semester_status existe e funciona
SELECT EXISTS (
  SELECT 1 
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
    AND p.proname = 'get_semester_status'
) AS function_exists;

-- 6. Testar a função get_semester_status
-- COMENTADO - descomente para testar
/*
SELECT * FROM public.get_semester_status();
*/

-- 7. Verificar registros existentes em backup_semestre
SELECT * FROM public.backup_semestre ORDER BY gerado_em DESC LIMIT 10;

-- 8. Verificar eventos do semestre atual para teste
SELECT 
  semestre_label,
  COUNT(*) as eventos_count,
  MIN(data) as primeira_data,
  MAX(data) as ultima_data
FROM public.agenda_eventos
GROUP BY semestre_label
ORDER BY semestre_label DESC;
