import { pacienteRepository } from '../../infrastructure/config/pacienteInjector.js';

/**
 * Use Case: listarPacientes
 * Retorna lista de pacientes com filtros opcionais
 * @param {Object} options - { limit, offset, searchTerm }
 */
export async function listarPacientes(options = {}) {
  try {
    return await pacienteRepository.fetchAll(options);
  } catch (err) {
    console.error('Use Case Error (listarPacientes):', err.message || err);
    throw new Error('Não foi possível listar pacientes.');
  }
}

export default listarPacientes;
