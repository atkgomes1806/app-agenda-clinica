-- PROMPT MÍNIMO PARA SUPABASE AI: Ajustes Essenciais (SEM privilégios de superuser)
-- Contexto: America/Sao_Paulo | Bucket: backups | ZIP com CSVs
-- Objetivo: Limitar visualização a 30 dias, purga segura com backup

/*
IMPORTANTE: Este prompt NÃO inclui comandos que requerem permissões elevadas.
Os ajustes de OWNER/GRANT devem ser feitos manualmente por um administrador.

ESSENCIAIS (aplicar agora):
1. Policy RLS para limite de 30 dias
2. Trigger para semestre_label (se não for coluna gerada)
3. Constraint de horário

IMPORTANTE (fazer depois com admin):
4. Ajustar OWNER e GRANT das funções SECURITY DEFINER
*/

-- ============================================================================
-- PARTE 1: AJUSTES QUE PODEM SER APLICADOS COM PERMISSÕES NORMAIS
-- ============================================================================

-- 1) RLS: Limitar visualização a até 30 dias no futuro (ESSENCIAL)
DROP POLICY IF EXISTS select_agenda_limite_30d ON public.agenda_eventos;

CREATE POLICY select_agenda_limite_30d
  ON public.agenda_eventos
  FOR SELECT TO authenticated
  USING (
    data <= ((now() AT TIME ZONE 'America/Sao_Paulo')::date + INTERVAL '30 days')
  );

-- 2) Constraint de integridade de horários (ESSENCIAL)
-- Nota: PostgreSQL não suporta IF NOT EXISTS em ADD CONSTRAINT
-- Se já existir, este comando falhará (seguro ignorar se constraint já foi criada)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_horario_valido'
  ) THEN
    ALTER TABLE public.agenda_eventos
    ADD CONSTRAINT ck_horario_valido CHECK (hora_inicio < hora_fim);
  END IF;
END $$;

-- 3) Trigger para semestre_label (ESSENCIAL se não for coluna gerada)
-- Verificar antes se calcular_semestre() retorna TEXT ou um record com .label
CREATE OR REPLACE FUNCTION public._set_semestre_label()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.semestre_label := public.calcular_semestre(NEW.data);
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_set_semestre_label ON public.agenda_eventos;
CREATE TRIGGER trg_set_semestre_label
BEFORE INSERT OR UPDATE OF data ON public.agenda_eventos
FOR EACH ROW EXECUTE FUNCTION public._set_semestre_label();

-- 4) Índices (RECOMENDADOS para performance)
CREATE INDEX IF NOT EXISTS idx_agenda_profissional_data 
  ON public.agenda_eventos (profissional_id, data);

-- Índice simples em data para suportar filtros de RLS e queries de intervalo
-- Nota: Índices parciais com now() ficam desatualizados, então usamos índice completo
CREATE INDEX IF NOT EXISTS idx_agenda_data 
  ON public.agenda_eventos (data);

-- ============================================================================
-- PARTE 2: COMANDOS PARA ADMINISTRADOR EXECUTAR (requer privilégios elevados)
-- ============================================================================

/*
ATENÇÃO: Os comandos abaixo FALHARÃO se você não for owner/superuser.
Salve este bloco e peça ao administrador do banco para executar:

-- A) Ajustar volatilidade (se get_semester_status usa CURRENT_DATE)
ALTER FUNCTION public.get_semester_status() VOLATILE;

-- B) CRÍTICO: Restringir execução das funções SECURITY DEFINER
-- Isso impede que usuários comuns disparem geração/purga massiva

ALTER FUNCTION public.gerar_eventos_futuros() OWNER TO service_role;
ALTER FUNCTION public.tentar_purga_semestre() OWNER TO service_role;

REVOKE EXECUTE ON FUNCTION public.gerar_eventos_futuros() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tentar_purga_semestre() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_eventos_futuros() TO service_role;
GRANT EXECUTE ON FUNCTION public.tentar_purga_semestre() TO service_role;

-- C) Adicionar advisory lock nas funções (edição manual do corpo)
-- Ver PROMPT_SUPABASE_AI_RETENCAO.sql para exemplos completos

*/

-- ============================================================================
-- CHECKLIST DE VALIDAÇÃO
-- ============================================================================
-- [ ] Policy 30d criada e ativa
-- [ ] Constraint horário adicionada
-- [ ] Trigger semestre_label funcionando (testar INSERT)
-- [ ] Índices criados (verificar com \d+ agenda_eventos)
-- [ ] OWNER/GRANT ajustados por admin
-- [ ] Advisory locks adicionados nas funções (por admin)
-- [ ] Testar: usuário authenticated NÃO consegue chamar gerar_eventos_futuros()
-- [ ] Testar: SELECT com data > 30 dias retorna vazio

-- FIM DO PROMPT MÍNIMO
