import { tiposTerapiaRepository } from '../../infrastructure/config/tiposTerapiaInjector.js';

export async function atualizarTipoTerapia(id, dados) {
  if (!id) throw new Error('ID do tipo de terapia é obrigatório.');
  if (dados.nome_terapia != null && String(dados.nome_terapia).trim() === '') {
    throw new Error('Nome do tipo de terapia não pode estar vazio.');
  }
  if (dados.tempo_sessao_minutos != null) {
    const n = Number(dados.tempo_sessao_minutos);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error('Tempo de sessão deve ser um inteiro positivo.');
    }
  }
  try {
    const atualizado = await tiposTerapiaRepository.update(id, dados);
    return atualizado;
  } catch (err) {
    console.error('Use Case Error (atualizarTipoTerapia):', err.message || err);
    throw new Error(err.message || 'Erro ao atualizar tipo de terapia.');
  }
}

export default atualizarTipoTerapia;
