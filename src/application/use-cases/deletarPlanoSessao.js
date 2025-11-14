import { planoSessaoRepository } from '../../infrastructure/config/planoSessaoInjector.js';

/**
 * Use Case: deletarPlanoSessao
 * @param {string} id
 */
export async function deletarPlanoSessao(id) {
  if (id == null || String(id).trim() === '') {
    throw new Error('ID do plano é obrigatório para exclusão.');
  }

  try {
    const result = await planoSessaoRepository.deletePlanoSessao(id);
    return result;
  } catch (err) {
    console.error('Use Case Error (deletarPlanoSessao):', err.message || err);
    throw new Error(`Não foi possível deletar o plano de sessão. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default deletarPlanoSessao;
