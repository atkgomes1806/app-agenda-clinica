import { pacienteRepository } from '../../infrastructure/config/pacienteInjector.js';

export async function atualizarPaciente(id, dados) {
  if (!id) throw new Error('ID do paciente é obrigatório para atualização.');
  if (dados.nome_completo != null && String(dados.nome_completo).trim() === '') {
    throw new Error('Nome completo não pode estar vazio.');
  }
  try {
    const atualizado = await pacienteRepository.updatePaciente(id, dados);
    return atualizado;
  } catch (err) {
    console.error('Use Case Error (atualizarPaciente):', err.message || err);
    throw new Error(err.message || 'Erro ao atualizar paciente.');
  }
}

export default atualizarPaciente;
