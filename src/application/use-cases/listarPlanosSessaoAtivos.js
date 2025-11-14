import { planoSessaoRepository } from '../../infrastructure/config/planoSessaoInjector.js';

export async function listarPlanosSessaoAtivos() {
  try {
    const planos = await planoSessaoRepository.fetchPlanosAtivos();
    return planos || [];
  } catch (err) {
    console.error('Use Case Error (listarPlanosSessaoAtivos):', err.message || err);
    throw new Error(err.message || 'Erro ao listar planos de sessão.');
  }
}

export default listarPlanosSessaoAtivos;
