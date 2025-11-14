-- COMANDOS PARA ADMINISTRADOR (requer privilégios elevados)
-- Execute este arquivo como superuser ou owner do banco

-- Contexto: Funções SECURITY DEFINER precisam ter execução restrita ao service_role
-- para evitar que usuários comuns disparem operações massivas (geração/purga).

-- 1) Ajustar volatilidade (OPCIONAL - ler nota abaixo)
-- NOTA: A função está como STABLE e usa current_timestamp AT TIME ZONE
-- current_timestamp é avaliado no início da transação (comportamento STABLE é adequado)
-- VOLATILE seria necessário apenas se usar clock_timestamp() ou random()
-- RECOMENDAÇÃO SUPABASE: Manter STABLE para melhor performance
-- Descomente a linha abaixo APENAS se precisar de avaliação a cada chamada:
-- ALTER FUNCTION public.get_semester_status() VOLATILE;

-- 2) CRÍTICO: Mudar owner das funções para service_role
-- IMPORTANTE: Após isso, apenas edge functions com SERVICE_ROLE_KEY poderão executar
-- Se seu app precisa chamar via RPC com authenticated, NÃO execute estes comandos
ALTER FUNCTION public.gerar_eventos_futuros() OWNER TO service_role;
ALTER FUNCTION public.tentar_purga_semestre() OWNER TO service_role;

-- 3) CRÍTICO: Revogar execução de roles públicos
-- Isso bloqueia chamadas diretas de usuários autenticados (comportamento desejado)
REVOKE EXECUTE ON FUNCTION public.gerar_eventos_futuros() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tentar_purga_semestre() FROM PUBLIC, anon, authenticated;

-- 4) CRÍTICO: Conceder apenas ao service_role
-- Apenas edge functions (cron/scheduled) poderão disparar geração e purga
GRANT EXECUTE ON FUNCTION public.gerar_eventos_futuros() TO service_role;
GRANT EXECUTE ON FUNCTION public.tentar_purga_semestre() TO service_role;

-- 5) (RECOMENDADO) Garantir search_path nas funções SECURITY DEFINER
-- IMPORTANTE: Funções SECURITY DEFINER devem fixar search_path para evitar ataques
-- Editar corpo das funções manualmente e adicionar no início:
-- PERFORM set_config('search_path', 'public', true);
-- Isso garante que objetos sempre resolvam para o schema public

-- 6) (RECOMENDADO) Advisory locks - Editar corpo das funções manualmente
/*
Para gerar_eventos_futuros(), adicionar:
  PERFORM pg_advisory_lock(74839201);
  -- ... lógica ...
  PERFORM pg_advisory_unlock(74839201);
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(74839201);
    RAISE;

Para tentar_purga_semestre(), adicionar:
  PERFORM pg_advisory_lock(74839202);
  -- ... lógica ...
  PERFORM pg_advisory_unlock(74839202);
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(74839202);
    RAISE;
*/

-- Validação pós-execução:
-- SELECT p.proname, pg_get_userbyid(p.proowner) as owner
-- FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public' 
--   AND p.proname IN ('gerar_eventos_futuros', 'tentar_purga_semestre');
-- 
-- Deve retornar owner = 'service_role' para ambas

-- FIM
