import { pacienteRepository } from '../../infrastructure/config/pacienteInjector.js';

/**
 * Use Case: criarPaciente
 * Valida nome_completo e delega criação ao repositório injetado
 * @param {Object} dados
 * @returns {Promise<Object>} paciente criado
 */
export async function criarPaciente(dados) {
  // Validação crítica: nome_completo não pode ser vazio ou nulo
  if (!dados || dados.nome_completo == null || String(dados.nome_completo).trim() === '') {
    throw new Error('O campo "nome_completo" é obrigatório.');
  }

  try {
    // Delega para o repositório
    const paciente = await pacienteRepository.createPaciente(dados);
    return paciente;
  } catch (err) {
    // Log técnico e tradução para mensagem amigável
    console.error('Use Case Error (criarPaciente):', err.message || err);
    throw new Error(`Não foi possível salvar o paciente. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default criarPaciente;
