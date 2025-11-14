# 🗃️ Retenção Semestral & Backup – Clínica TEA

**Timezone**: America/Sao_Paulo  
**Bucket de Backup**: `backups`  
**Formato Backup**: ZIP contendo múltiplos CSV (um por tabela) + manifest JSON + checksum SHA256

---
## 🎯 Objetivos
1. Limitar visualização de eventos futuros a 30 dias.
2. Reter dados de agenda por semestre (Jan–Jun = H1, Jul–Dez = H2) e purgar após 6 meses, com janela de segurança até dia 10 do mês seguinte.
3. Garantir backup completo (agenda + cadastros base) antes da purga.
4. Materializar eventos em `agenda_eventos` para performance e simplificar regras de retenção.

---
## 🧱 Estrutura Recomendada das Tabelas
### `public.agenda_eventos`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | gerado via gen_random_uuid() |
| plano_sessao_id | uuid (FK) | referência ao plano original |
| profissional_id | uuid (FK) | redundante para filtro rápido |
| paciente_id | uuid (FK) | opcional se relação existe (para UX) |
| tipo_terapia_id | uuid (FK) | para relatórios |
| data | date | index principal + filtro RLS |
| hora_inicio | time | composição de intervalo |
| hora_fim | time | validação sobreposição |
| semestre_label | text | ex: 2025H1 (generated) |
| status | text | scheduled | canceled | done |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | trigger de update |

Índices sugeridos adicionais:
- `CREATE UNIQUE INDEX idx_agenda_plano_data_unique ON agenda_eventos (plano_sessao_id, data, hora_inicio);`
- `CREATE INDEX idx_agenda_profissional_data ON agenda_eventos (profissional_id, data);`
- `CREATE INDEX idx_agenda_data ON agenda_eventos (data);` — Suporta filtros RLS e queries de intervalo
  
Nota: Índices parciais com `now()` ficam desatualizados (criados com timestamp fixo, não atualizam automaticamente).

### `public.backup_semestre`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid (PK) | gerado |
| semestre_label | text (UNIQUE) | 2025H1, 2025H2 |
| semestre_inicio | date | 2025-01-01 |
| semestre_fim | date | 2025-06-30 |
| gerado_em | timestamptz | timestamp export |
| arquivo_path | text | `backups/2025H1/backup-2025H1.zip` |
| manifest_json | jsonb | metadados: tabelas, counts, checksum |
| checksum_sha256 | text | integridade do ZIP |
| eventos_count | int | número de linhas exportadas |
| pacientes_count | int | snapshot cadastros |
| profissionais_count | int | idem |
| tipos_terapia_count | int | idem |

Índice único: `CREATE UNIQUE INDEX idx_backup_semestre_unique_label ON backup_semestre (semestre_label);`

---
## 🔐 RLS Policies (Refinamentos)
1. SELECT restrito a usuários autenticados (já existente).  
2. Limite de visualização futura (> 30 dias):
```sql
CREATE POLICY select_agenda_30d ON agenda_eventos
FOR SELECT TO authenticated
USING (data <= CURRENT_DATE + INTERVAL '30 days');
```
3. (Opcional) Escopo por paciente:
```sql
CREATE POLICY select_agenda_paciente ON agenda_eventos
FOR SELECT TO authenticated
USING (
  paciente_id IS NULL
  OR paciente_id IN (
    SELECT p.id FROM pacientes p WHERE p.usuario_id = auth.uid()
  )
);
```
4. Funções `SECURITY DEFINER` NÃO devem ser executáveis por qualquer role comum; conceder apenas a `service_role`.

---
## 🧮 Funções – Ajustes Recomendados
### `calcular_semestre(date)`
- IMMUTABLE ok.  
- Retornar: label, inicio, fim.

### `gerar_eventos_futuros()`
- SECURITY DEFINER + OWNER = service_role.
- Lock: usar advisory lock para evitar corrida.
```sql
SELECT pg_advisory_lock(74839201);
-- geração
SELECT pg_advisory_unlock(74839201);
```
- Lógica: gerar somente até CURRENT_DATE + 30 dias; pular existentes.

### `tentar_purga_semestre()`
- Conferir: data atual > (semestre_anterior_fim + 10 dias).
- Verificar backup existente para semestre anterior.
- Deletar apenas eventos com data <= semestre_anterior_fim.
- Transação + contagem registros purgados.

### `get_semester_status()`
- Se usa CURRENT_DATE, volatilidade deveria ser VOLATILE (não STABLE).
- Campos: current_semester_label, previous_semester_label, backup_exists_previous, purge_ready, days_until_purge_window.

### Grants/Owner
```sql
ALTER FUNCTION gerar_eventos_futuros() OWNER TO service_role;
ALTER FUNCTION tentar_purga_semestre() OWNER TO service_role;
REVOKE EXECUTE ON FUNCTION gerar_eventos_futuros() FROM authenticated;
REVOKE EXECUTE ON FUNCTION tentar_purga_semestre() FROM authenticated;
GRANT EXECUTE ON FUNCTION gerar_eventos_futuros() TO service_role;
GRANT EXECUTE ON FUNCTION tentar_purga_semestre() TO service_role;
```

---
## 🕒 Cron & Edge Functions
### Frequência
- Diário (06:00 local): `gerar_eventos_futuros()`
- Dia 01–05 após virar semestre: gerar backup se não existir.
- Dia 11 após semestre anterior: `tentar_purga_semestre()` (somente se backup existe).

### Variáveis
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TZ=America/Sao_Paulo`

### Skeleton (Deno / TypeScript)
```ts
// edge/functions/daily-maintenance/index.ts
import 'https://deno.land/std@0.203.0/dotenv/load.ts';
const url = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers = { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` };

async function rpc(fn: string, body: any = {}) {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${fn} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const gen = await rpc('gerar_eventos_futuros');
    return new Response(JSON.stringify({ ok: true, gen }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500 });
  }
}
```

```ts
// edge/functions/semester-maintenance/index.ts
// 1) Gera backup se dentro da janela (1-10) e não existe.
// 2) Executa purga se janela > dia 10 e purge_ready.
```

---
## 📦 Processo de Backup
1. Consultar `get_semester_status()` → identificar `previous_semester_label` e se backup existe.
2. Gerar CSVs (SELECT * FROM ... ORDER BY id) para:
   - agenda_eventos (apenas semestre anterior)
   - pacientes, profissionais, tipos_terapia (snapshot completo)
3. Manifest JSON:
```json
{
  "semestre_label": "2025H1",
  "generated_at": "2025-07-03T12:34:00Z",
  "tables": {
    "agenda_eventos": { "rows": 1234, "sha256": "..." },
    "pacientes": { "rows": 200 },
    "profissionais": { "rows": 12 },
    "tipos_terapia": { "rows": 7 }
  },
  "global_checksum": "<sha256 do zip>"
}
```
4. Escrever ZIP em `backups/<semestre_label>/backup-<semestre_label>.zip`.
5. Inserir linha em `backup_semestre` com counts + checksum.

---
## ⚠️ Alertas e UI (Próxima Fase)
- Banner se faltam ≤ 10 dias para janela de backup do semestre anterior sem backup.
- Tooltip em datas > 30 dias futuro: "Eventos além de 30 dias são provisionados automaticamente diariamente".
- Indicador de status do semestre (usar `get_semester_status()`).
- Botão "Gerar Backup Agora" visível somente se window válida e backup ausente.

---
## 🧪 Testes Recomendados
1. Criar plano, rodar função geração → eventos não duplicados.
2. Backup: contar linhas CSV == eventos_count.
3. Purga: após rodar tentar_purga_semestre, nenhum evento <= semestre_fim anterior.
4. RLS: SELECT de evento com data > 30 dias deve retornar vazio para authenticated.

---
## 🗂️ Checklist
- [ ] Ajustar owner/grants funções definidoras
- [ ] Adicionar advisory lock em gerar_eventos_futuros
- [ ] Revisar volatilidade de get_semester_status (possivelmente VOLATILE)
- [ ] Criar índices adicionais (profissional + data, parcial 30d)
- [ ] Implementar backup export (edge)
- [ ] Implementar purga (edge) com validação prévia
- [ ] Adicionar policies RLS futuras (30d / paciente) conforme necessidade
- [ ] Integrar UI (banner, status, botão backup)

---
## 🔄 Próximos Passos Prioritários
1. Segurança: Revisar grants/owner das funções.
2. Confiabilidade: Advisory lock + logs estruturados.
3. Observabilidade: Registrar execuções (tabela de auditoria opcional).
4. Edge Functions: Implementar daily-maintenance e semester-maintenance.
5. Backup: Implementar export + registro em backup_semestre.
6. UI: Consumir get_semester_status e exibir alertas.
7. Purga: Testes em ambiente de staging antes de produção.

---
**Autor**: Sistema de apoio – Retenção Semestral
