import { tiposTerapiaRepository } from '../../infrastructure/config/tiposTerapiaInjector.js';

export async function excluirTipoTerapia(id) {
  if (!id) throw new Error('ID do tipo de terapia é obrigatório.');
  try {
    await tiposTerapiaRepository.delete(id);
    return true;
  } catch (err) {
    console.error('Use Case Error (excluirTipoTerapia):', err.message || err);
    throw new Error(err.message || 'Erro ao excluir tipo de terapia.');
  }
}

export default excluirTipoTerapia;
