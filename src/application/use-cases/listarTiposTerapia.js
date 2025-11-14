import { tiposTerapiaRepository } from '../../infrastructure/config/tiposTerapiaInjector.js';

/**
 * Use Case: listarTiposTerapia
 * Retorna lista de tipos de terapia com filtros opcionais
 * @param {Object} options - { limit, offset, searchTerm }
 */
export async function listarTiposTerapia(options = {}) {
  try {
    return await tiposTerapiaRepository.fetchAll(options);
  } catch (err) {
    console.error('Use Case Error (listarTiposTerapia):', err.message || err);
    throw new Error('Não foi possível listar tipos de terapia.');
  }
}

export default listarTiposTerapia;
