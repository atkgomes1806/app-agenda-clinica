import { planoSessaoRepository } from '../../infrastructure/config/planoSessaoInjector.js';

export async function atualizarPlanoSessao(id, dados) {
  if (id == null || String(id).trim() === '') {
    throw new Error('ID do plano é obrigatório para atualização.');
  }

  try {
    const updated = await planoSessaoRepository.updatePlanoSessao(id, dados);
    return updated;
  } catch (err) {
    console.error('Use Case Error (atualizarPlanoSessao):', err.message || err);
    throw new Error(`Não foi possível atualizar o plano de sessão. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default atualizarPlanoSessao;
