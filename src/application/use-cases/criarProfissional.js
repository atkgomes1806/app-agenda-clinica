import { profissionaisRepository } from '../../infrastructure/config/profissionaisInjector.js';

/**
 * Use Case: criarProfissional
 * Valida e cria um novo profissional
 * @param {Object} dados - { nome, tipo_terapia_id }
 */
export async function criarProfissional(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new Error('Dados do profissional são obrigatórios.');
  }

  const { nome, tipo_terapia_id } = dados;

  // Validações
  if (!nome || String(nome).trim() === '') {
    throw new Error('Nome é obrigatório.');
  }

  if (!tipo_terapia_id || String(tipo_terapia_id).trim() === '') {
    throw new Error('Tipo de terapia é obrigatório.');
  }

  try {
    const novoProfissional = await profissionaisRepository.create({
      nome: String(nome).trim(),
      tipo_terapia_id
    });

    return novoProfissional;
  } catch (err) {
    console.error('Use Case Error (criarProfissional):', err.message || err);
    throw new Error(`Não foi possível criar o profissional. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default criarProfissional;
