import { profissionaisRepository } from '../../infrastructure/config/profissionaisInjector.js';

/**
 * Use Case: listarProfissionais
 * Retorna lista de profissionais com filtros opcionais
 * @param {Object} options - { limit, offset, searchTerm }
 */
export async function listarProfissionais(options = {}) {
  try {
    return await profissionaisRepository.fetchAll(options);
  } catch (err) {
    console.error('Use Case Error (listarProfissionais):', err.message || err);
    throw new Error('Não foi possível listar profissionais.');
  }
}

export default listarProfissionais;
