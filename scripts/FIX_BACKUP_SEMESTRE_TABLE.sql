-- SQL para Corrigir a Tabela backup_semestre
-- Adicionar coluna arquivo_path que está faltando

-- 1. Verificar estrutura atual da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'backup_semestre'
ORDER BY ordinal_position;

-- 2. Adicionar coluna arquivo_path (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'backup_semestre' 
      AND column_name = 'arquivo_path'
  ) THEN
    ALTER TABLE public.backup_semestre
    ADD COLUMN arquivo_path TEXT;
    
    RAISE NOTICE 'Coluna arquivo_path adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna arquivo_path já existe';
  END IF;
END $$;

-- 3. Adicionar coluna eventos_count (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'backup_semestre' 
      AND column_name = 'eventos_count'
  ) THEN
    ALTER TABLE public.backup_semestre
    ADD COLUMN eventos_count INTEGER DEFAULT 0;
    
    RAISE NOTICE 'Coluna eventos_count adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna eventos_count já existe';
  END IF;
END $$;

-- 4. Adicionar coluna manifest_json (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'backup_semestre' 
      AND column_name = 'manifest_json'
  ) THEN
    ALTER TABLE public.backup_semestre
    ADD COLUMN manifest_json JSONB;
    
    RAISE NOTICE 'Coluna manifest_json adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna manifest_json já existe';
  END IF;
END $$;

-- 5. Verificar estrutura final
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'backup_semestre'
ORDER BY ordinal_position;

-- 6. Criar RLS policy para permitir INSERT via service_role
-- (se ainda não existir)
ALTER TABLE public.backup_semestre ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_all_backup ON public.backup_semestre;
CREATE POLICY service_role_all_backup 
  ON public.backup_semestre
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Testar INSERT (descomentar para testar)
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
  '{"semestre_label":"2025-1","generated_at":"2025-11-08T00:00:00Z","tables":{"agenda_eventos":{"rows":0}},"note":"Empty backup (no events in this semester)"}'::jsonb
);
*/

-- 8. Verificar dados inseridos
SELECT * FROM public.backup_semestre ORDER BY gerado_em DESC;
