import { planoSessaoRepository } from '../../infrastructure/config/planoSessaoInjector.js';
import listarProfissionais from './listarProfissionais.js';

// Utilitário: converte HH:MM[:SS] para segundos
function timeToSeconds(t) {
  if (t == null) return 0;
  const parts = String(t).split(':').map((p) => parseInt(p, 10) || 0);
  const [hh = 0, mm = 0, ss = 0] = parts;
  return hh * 3600 + mm * 60 + ss;
}

// Fallback: calcula ocupação agregando a partir dos planos ativos quando a RPC não estiver disponível
async function calcularOcupacaoFallback() {
  const planos = await planoSessaoRepository.fetchPlanosAtivos();
  const mapa = new Map(); // profissional_id -> { total_sessao_minutos, contagem_sessao }

  for (const p of (planos || [])) {
    const profId = String(p.profissional_id || '');
    if (!profId) continue;
    const sIni = timeToSeconds(p.hora_inicio);
    const sFim = timeToSeconds(p.hora_fim);
    const minutos = Math.max(0, Math.round((sFim - sIni) / 60));

    const atual = mapa.get(profId) || { total_sessao_minutos: 0, contagem_sessao: 0 };
    atual.total_sessao_minutos += minutos;
    atual.contagem_sessao += 1;
    mapa.set(profId, atual);
  }

  return Array.from(mapa.entries()).map(([profissional_id, v]) => ({ profissional_id, ...v }));
}

/**
 * Use Case: gerarRelatorioOcupacao
 * Combina os dados agregados (fetchTaxaOcupacao) com a lista de profissionais para gerar relatório.
 * @returns {Promise<Array>} lista de { profissional_id, nome_completo, contagem_sessao, total_sessao_minutos, ocupacao_em_horas }
 */
export default async function gerarRelatorioOcupacao() {
  try {
    // Tenta via RPC; se falhar, usa fallback local
    let ocupacaoData;
    try {
      ocupacaoData = await planoSessaoRepository.fetchTaxaOcupacao();
    } catch (rpcErr) {
      console.warn('RPC get_ocupacao_profissional indisponível. Usando fallback local.', rpcErr?.message || rpcErr);
      ocupacaoData = await calcularOcupacaoFallback();
    }

    const profissionais = await listarProfissionais();
    // Também obter o mapa profissional_id -> terapia (assumindo uma terapia por profissional)
    // Se o join já vier nos planos, podemos inferir durante o fallback. Caso contrário, faremos um segundo passo aqui.
    // Usaremos os planos ativos para montar um mapa simples de terapia por profissional.
    const planosParaTerapia = await planoSessaoRepository.fetchPlanosAtivos();
    const terapiaPorProf = new Map();
    for (const p of (planosParaTerapia || [])) {
      if (p.profissional_id && p.tipo_terapia_nome) {
        const key = String(p.profissional_id);
        // assume primeira terapia encontrada como terapia vinculada principal
        if (!terapiaPorProf.has(key)) terapiaPorProf.set(key, p.tipo_terapia_nome);
      }
    }

    // Mapear ocupacao por profissional_id para lookup rápido
    const mapa = new Map();
    (ocupacaoData || []).forEach((row) => {
      // row deve ter profissional_id, total_sessao_minutos, contagem_sessao
      mapa.set(String(row.profissional_id), {
        total_sessao_minutos: Number(row.total_sessao_minutos) || 0,
        contagem_sessao: Number(row.contagem_sessao) || 0,
      });
    });

    const resultado = (profissionais || []).map((p) => {
      const id = String(p.id);
      const oc = mapa.get(id) || { total_sessao_minutos: 0, contagem_sessao: 0 };
      const ocupacao_em_horas = Number(oc.total_sessao_minutos) / 60;

      return {
        profissional_id: id,
        nome_completo: p.nome || null, // profissionais só tem coluna 'nome', não 'nome_completo'
        contagem_sessao: oc.contagem_sessao,
        total_sessao_minutos: oc.total_sessao_minutos,
        ocupacao_em_horas,
        // coluna adicional esperada na UI
        terapia: terapiaPorProf.get(id) || null,
        pacientes_distintos: undefined, // preenchido abaixo quando disponível
      };
    });

    // Calcula pacientes distintos por profissional usando planos ativos
    const pacientesDistintosPorProf = new Map();
    for (const p of (planosParaTerapia || [])) {
      const profId = String(p.profissional_id || '');
      const pacienteId = String(p.paciente_id || '');
      if (!profId || !pacienteId) continue;
      if (!pacientesDistintosPorProf.has(profId)) pacientesDistintosPorProf.set(profId, new Set());
      pacientesDistintosPorProf.get(profId).add(pacienteId);
    }

    // Anexa pacientes_distintos
    for (const r of resultado) {
      const setPac = pacientesDistintosPorProf.get(r.profissional_id);
      r.pacientes_distintos = setPac ? setPac.size : 0;
    }

    return resultado;
  } catch (err) {
    console.error('Use Case Error (gerarRelatorioOcupacao):', err.message || err);
    throw new Error('Não foi possível gerar relatório de ocupação.');
  }
}
