import { profissionaisRepository } from '../../infrastructure/config/profissionaisInjector.js';

export async function atualizarProfissional(id, dados) {
  if (!id) throw new Error('ID do profissional é obrigatório.');
  if (dados.nome != null && String(dados.nome).trim() === '') {
    throw new Error('Nome do profissional não pode estar vazio.');
  }
  if (dados.tipo_terapia_id != null && String(dados.tipo_terapia_id).trim() === '') {
    throw new Error('Tipo de terapia inválido.');
  }
  try {
    const atualizado = await profissionaisRepository.update(id, dados);
    return atualizado;
  } catch (err) {
    console.error('Use Case Error (atualizarProfissional):', err.message || err);
    throw new Error(err.message || 'Erro ao atualizar profissional.');
  }
}

export default atualizarProfissional;
