-- VALIDAÇÃO PRÉ-EXECUÇÃO: Verificar estado atual antes de aplicar ADMIN_PRIVILEGES_REQUIRED.sql

-- 1) Verificar owner atual das funções
SELECT 
  p.proname AS function_name,
  pg_get_userbyid(p.proowner) AS current_owner,
  p.provolatile AS volatility, -- s=STABLE, v=VOLATILE, i=IMMUTABLE
  p.prosecdef AS is_security_definer
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('gerar_eventos_futuros', 'tentar_purga_semestre', 'get_semester_status')
ORDER BY p.proname;

-- Resultado esperado ANTES das alterações:
-- gerar_eventos_futuros    | postgres (ou seu user) | s ou v | true
-- tentar_purga_semestre    | postgres (ou seu user) | s ou v | true
-- get_semester_status      | postgres (ou seu user) | s      | false

-- 2) Verificar permissões atuais
SELECT 
  p.proname AS function_name,
  array_agg(DISTINCT pg_get_userbyid(acl.grantee)) AS granted_to
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN LATERAL (
  SELECT (aclexplode(p.proacl)).grantee
) acl ON true
WHERE n.nspname = 'public' 
  AND p.proname IN ('gerar_eventos_futuros', 'tentar_purga_semestre')
GROUP BY p.proname;

-- 3) Verificar se service_role existe
SELECT rolname, rolsuper, rolcanlogin 
FROM pg_roles 
WHERE rolname = 'service_role';

-- Deve retornar 1 linha com service_role

-- 4) Verificar se há chamadas RPC dessas funções no código do app
-- (Você precisa verificar manualmente no código frontend)
-- Se encontrar chamadas como:
--   supabase.rpc('gerar_eventos_futuros', ...)
--   supabase.rpc('tentar_purga_semestre', ...)
-- ENTÃO: NÃO execute ADMIN_PRIVILEGES_REQUIRED.sql (vai quebrar o app)

-- 5) Verificar uso de current_timestamp vs clock_timestamp em get_semester_status
-- (Para decidir se deve ser VOLATILE ou STABLE)
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'get_semester_status' AND pronamespace = 'public'::regnamespace;

-- Se usar current_timestamp → STABLE é correto (avaliado no início da transação)
-- Se usar clock_timestamp() → VOLATILE é necessário (avaliado a cada chamada)
-- Se usar now() → equivalente a current_timestamp → STABLE é correto

-- ============================================================================
-- DECISÃO: Após rodar essas queries, você deve:
-- ============================================================================
-- ✅ EXECUTAR ADMIN_PRIVILEGES_REQUIRED.sql SE:
--    - service_role existe
--    - Nenhuma chamada RPC dessas funções no código do app
--    - Funções serão usadas APENAS por edge functions/cron
--
-- ❌ NÃO EXECUTAR SE:
--    - App faz chamadas RPC dessas funções (vai quebrar)
--    - service_role não existe (comando falhará)
--
-- 📝 NOTA sobre get_semester_status:
--    - Se usar current_timestamp/now() → manter STABLE (melhor performance)
--    - Se usar clock_timestamp() → alterar para VOLATILE (mais raro)
