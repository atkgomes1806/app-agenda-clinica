import { tiposTerapiaRepository } from '../../infrastructure/config/tiposTerapiaInjector.js';

/**
 * Use Case: criarTipoTerapia
 * Valida e cria um novo tipo de terapia
 * @param {Object} dados - { nome_terapia, tempo_sessao_minutos }
 */
export async function criarTipoTerapia(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new Error('Dados do tipo de terapia são obrigatórios.');
  }

  const { nome_terapia, tempo_sessao_minutos } = dados;

  // Validações
  if (!nome_terapia || String(nome_terapia).trim() === '') {
    throw new Error('Nome da terapia é obrigatório.');
  }

  const tempo = tempo_sessao_minutos ? Number(tempo_sessao_minutos) : 40;
  if (!Number.isInteger(tempo) || tempo <= 0) {
    throw new Error('Tempo de sessão deve ser um número inteiro positivo.');
  }

  try {
    const novoTipo = await tiposTerapiaRepository.create({
      nome_terapia: String(nome_terapia).trim(),
      tempo_sessao_minutos: tempo
    });

    return novoTipo;
  } catch (err) {
    console.error('Use Case Error (criarTipoTerapia):', err.message || err);
    throw new Error(`Não foi possível criar o tipo de terapia. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default criarTipoTerapia;
