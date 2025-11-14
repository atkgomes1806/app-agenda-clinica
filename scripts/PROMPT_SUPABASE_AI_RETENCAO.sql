-- PROMPT PARA SUPABASE AI: Ajustes de Retenção Semestral, Backup e Segurança
-- Contexto:
-- Timezone: America/Sao_Paulo
-- Bucket de backup: backups
-- Formato backup: ZIP com CSVs (agenda_eventos semestre anterior + pacientes + profissionais + tipos_terapia) + manifest.json + checksum
-- Objetivo: Limitar visualização futura a 30 dias, gerar eventos diariamente, backup após mudança de semestre, purga segura após dia 10 se backup existe.

/*
INSTRUÇÕES: Aplique os ajustes abaixo em objetos já existentes:
1. Revisar volatilidade de get_semester_status()
2. Ajustar OWNER e GRANT de funções SECURITY DEFINER
3. Criar policies RLS adicionais (limite 30 dias futuro)
4. Criar índices complementares e parciais
5. Adicionar constraint de horário
6. Adicionar trigger para semestre_label (se não for coluna gerada)
7. Inserir advisory lock em funções de geração/purga (mostrar blocos de código PL/pgSQL sugeridos)
*/

-- 1) Volatilidade de função que depende de CURRENT_DATE/now()
ALTER FUNCTION public.get_semester_status() VOLATILE; -- Caso use CURRENT_DATE; se já for VOLATILE, ignorar.

-- 2) Ajustar OWNER e GRANT das funções SECURITY DEFINER
ALTER FUNCTION public.gerar_eventos_futuros() OWNER TO service_role;
ALTER FUNCTION public.tentar_purga_semestre() OWNER TO service_role;

REVOKE EXECUTE ON FUNCTION public.gerar_eventos_futuros() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tentar_purga_semestre() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gerar_eventos_futuros() TO service_role;
GRANT EXECUTE ON FUNCTION public.tentar_purga_semestre() TO service_role;

-- (Opcional) Garantir search_path consistente dentro das funções SECURITY DEFINER
-- Exemplo de inclusão no início do corpo PL/pgSQL:
-- PERFORM set_config('search_path', 'public', true);

-- 3) RLS: Limitar visualização a até 30 dias no futuro
-- Política adicional (verificar conflito com existentes; policies são OR)
DROP POLICY IF EXISTS select_agenda_limite_30d ON public.agenda_eventos;

CREATE POLICY select_agenda_limite_30d 
ON public.agenda_eventos
FOR SELECT TO authenticated
USING (data <= ((now() at time zone 'America/Sao_Paulo')::date + INTERVAL '30 days'));

-- (Opcional) Escopo por paciente, somente se desejado:
-- CREATE POLICY select_agenda_paciente ON public.agenda_eventos
-- FOR SELECT TO authenticated
-- USING (
--   paciente_id IS NULL OR paciente_id IN (
--     SELECT p.id FROM public.pacientes p WHERE p.usuario_id = auth.uid()
--   )
-- );

-- 4) Índices complementares
-- Já existe unique para (plano_sessao_id, data, hora_inicio) -> manter.
-- Adicionar índice composto para consultas por profissional + data.
CREATE INDEX IF NOT EXISTS idx_agenda_profissional_data ON public.agenda_eventos (profissional_id, data);

-- Índice simples em data para suportar filtros de RLS e queries de intervalo
-- Nota: Índices parciais com now() ficam desatualizados rapidamente (não atualizam dinamicamente)
CREATE INDEX IF NOT EXISTS idx_agenda_data ON public.agenda_eventos (data);

-- 5) Constraint de integridade de horários
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_horario_valido'
  ) THEN
    ALTER TABLE public.agenda_eventos
    ADD CONSTRAINT ck_horario_valido CHECK (hora_inicio < hora_fim);
  END IF;
END $$;

-- 6) Trigger para semestre_label (se a coluna não for gerada automaticamente)
-- Assumindo que calcular_semestre(date) retorna label TEXT.
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

-- 7) Advisory locks em funções (sugestão de blocos)
-- Exemplo para gerar_eventos_futuros():
/*
CREATE OR REPLACE FUNCTION public.gerar_eventos_futuros()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _lock_acquired boolean;
  _limite date := (now() at time zone 'America/Sao_Paulo')::date + INTERVAL '30 days';
  _gerados int := 0;
BEGIN
  PERFORM set_config('search_path','public',true);
  PERFORM pg_advisory_lock(74839201);
  -- Lógica: selecionar planos ativos e gerar eventos faltantes até _limite
  -- Exemplo pseudo:
  -- INSERT INTO public.agenda_eventos(...)
  -- SELECT ... WHERE data BETWEEN CURRENT_DATE AND _limite
  -- ON CONFLICT DO NOTHING;  GET DIFF count.
  PERFORM pg_advisory_unlock(74839201);
  RETURN json_build_object('gerados', _gerados, 'limite', _limite);
EXCEPTION WHEN OTHERS THEN
  PERFORM pg_advisory_unlock(74839201);
  RAISE;
END;$$;
*/

-- Exemplo para tentar_purga_semestre():
/*
CREATE OR REPLACE FUNCTION public.tentar_purga_semestre()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  _sem_prev_label text;
  _sem_prev_fim date;
  _purgados int := 0;
  _backup_exists boolean := false;
BEGIN
  PERFORM set_config('search_path','public',true);
  PERFORM pg_advisory_lock(74839202);
  -- Obter semestre atual e anterior (reusar calcular_semestre ou lógica interna)
  -- Verificar se _hoje > _sem_prev_fim + INTERVAL '10 days'
  -- Checar backup existente em backup_semestre (semestre_label = _sem_prev_label)
  -- Se conditions ok: DELETE FROM agenda_eventos WHERE data <= _sem_prev_fim RETURNING count
  PERFORM pg_advisory_unlock(74839202);
  RETURN json_build_object('purgados', _purgados, 'semestre', _sem_prev_label);
EXCEPTION WHEN OTHERS THEN
  PERFORM pg_advisory_unlock(74839202);
  RAISE;
END;$$;
*/

-- 8) (Opcional) Auditoria de execuções (criar tabela caso necessário)
-- CREATE TABLE IF NOT EXISTS public.jobs_auditoria (
--   id bigserial PRIMARY KEY,
--   job text NOT NULL,
--   started_at timestamptz DEFAULT now(),
--   finished_at timestamptz,
--   success boolean,
--   details jsonb
-- );

-- 9) Checklist final (para conferência manual):
-- [ ] get_semester_status VOLATILE ajustado
-- [ ] OWNER service_role nas funções definidoras
-- [ ] EXECUTE restrito a service_role
-- [ ] Policy 30d criada
-- [ ] Índices adicionais criados
-- [ ] Constraint horário adicionada
-- [ ] Trigger semestre_label criada
-- [ ] Advisory lock incorporado nos corpos (após edição manual das funções)
-- [ ] Testar geração/purga em staging

-- FIM DO PROMPT
