import { profissionaisRepository } from '../../infrastructure/config/profissionaisInjector.js';

export async function excluirProfissional(id) {
  if (!id) throw new Error('ID do profissional é obrigatório para exclusão.');
  try {
    await profissionaisRepository.delete(id);
    return true;
  } catch (err) {
    console.error('Use Case Error (excluirProfissional):', err.message || err);
    throw new Error(err.message || 'Erro ao excluir profissional.');
  }
}

export default excluirProfissional;
