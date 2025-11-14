import { planoSessaoRepository } from '../../infrastructure/config/planoSessaoInjector.js';

// Validador simples de formato de hora (HH:MM ou HH:MM:SS)
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function timeToSeconds(t) {
  const parts = t.split(':').map((p) => parseInt(p, 10));
  const hh = parts[0] || 0;
  const mm = parts[1] || 0;
  const ss = parts[2] || 0;
  return hh * 3600 + mm * 60 + ss;
}

/**
 * Use Case: criarPlanoSessao
 * Valida campos obrigatórios e regras de negócio, delega a persistência ao repositório injetado.
 * @param {Object} dados - Deve incluir usuario_criacao_id se o usuário estiver autenticado
 */
export async function criarPlanoSessao(dados) {
  // Validações críticas de presença
  if (!dados || typeof dados !== 'object') {
    throw new Error('Dados do plano de sessão são obrigatórios.');
  }

  const requiredFields = ['paciente_id', 'profissional_id', 'tipo_terapia_id', 'dia_semana', 'hora_inicio', 'hora_fim'];
  for (const f of requiredFields) {
    if (dados[f] == null || String(dados[f]).trim() === '') {
      throw new Error(`Campo obrigatório ausente: ${f}`);
    }
  }

  // usuario_criacao_id é obrigatório conforme schema (FK para perfis.user_id)
  if (!dados.usuario_criacao_id) {
    throw new Error('Campo obrigatório ausente: usuario_criacao_id (usuário autenticado)');
  }

  // dia_semana deve estar entre 0 e 6
  const dia = Number(dados.dia_semana);
  if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
    throw new Error('O campo dia_semana deve ser um inteiro entre 0 (Dom) e 6 (Sáb).');
  }

  // Valida formato de hora
  if (!timeRegex.test(String(dados.hora_inicio))) {
    throw new Error('hora_inicio deve estar no formato HH:MM ou HH:MM:SS.');
  }
  if (!timeRegex.test(String(dados.hora_fim))) {
    throw new Error('hora_fim deve estar no formato HH:MM ou HH:MM:SS.');
  }

  // hora_inicio < hora_fim
  const sInicio = timeToSeconds(String(dados.hora_inicio));
  const sFim = timeToSeconds(String(dados.hora_fim));
  if (sInicio >= sFim) {
    throw new Error('hora_inicio deve ser anterior a hora_fim.');
  }

  // Normalização: garantir que dia_semana seja inteiro
  dados.dia_semana = dia;

  try {
    const novo = await planoSessaoRepository.createPlanoSessao(dados);
    return novo;
  } catch (err) {
    console.error('Use Case Error (criarPlanoSessao):', err.message || err);
    throw new Error(`Não foi possível criar o plano de sessão. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default criarPlanoSessao;
