import { pacienteRepository } from '../../infrastructure/config/pacienteInjector.js';

export async function excluirPaciente(id) {
  if (!id) throw new Error('ID do paciente é obrigatório para exclusão.');
  try {
    await pacienteRepository.deletePaciente(id);
    return true;
  } catch (err) {
    console.error('Use Case Error (excluirPaciente):', err.message || err);
    throw new Error(err.message || 'Erro ao excluir paciente.');
  }
}

export default excluirPaciente;
