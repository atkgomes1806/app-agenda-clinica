# Scripts SQL e Testes

Esta pasta contém scripts SQL para configuração e manutenção do sistema de retenção semestral.

## Scripts de Configuração

- **`ADMIN_PRIVILEGES_REQUIRED.sql`** - Comandos que requerem privilégios elevados (OWNER/GRANT)
- **`PROMPT_SUPABASE_AI_RETENCAO.sql`** - Prompt completo para Supabase AI
- **`PROMPT_SUPABASE_AI_MINIMO.sql`** - Prompt mínimo (sem privilégios elevados)

## Scripts de Teste e Debug

- **`DEBUG_BACKUP_SEMESTRE.sql`** - Debug da tabela backup_semestre e edge function
- **`FIX_BACKUP_SEMESTRE_TABLE.sql`** - Correção da estrutura da tabela backup_semestre
- **`VALIDACAO_PRE_ADMIN.sql`** - Validação antes de executar comandos admin

## Como usar

1. Execute primeiro os scripts de configuração básica
2. Use os scripts de debug quando necessário
3. Scripts admin devem ser executados por usuário com privilégios elevados

## Ordem recomendada

1. `PROMPT_SUPABASE_AI_MINIMO.sql` (usuário normal)
2. `ADMIN_PRIVILEGES_REQUIRED.sql` (administrador)
3. `VALIDACAO_PRE_ADMIN.sql` (validação)