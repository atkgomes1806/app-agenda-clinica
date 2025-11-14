import { usuarioRepository } from '../../infrastructure/config/usuarioInjector.js';

/**
 * Use Case: atualizarUsuario
 * Atualiza dados do perfil de um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} dados - { nome, tipo_perfil }
 */
export async function atualizarUsuario(userId, dados) {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório.');
  }

  if (!dados || typeof dados !== 'object') {
    throw new Error('Dados para atualização são obrigatórios.');
  }

  // Validações
  if (dados.nome !== undefined && String(dados.nome).trim() === '') {
    throw new Error('Nome não pode ser vazio.');
  }

  if (dados.tipo_perfil && !['ADM', 'Usuario'].includes(dados.tipo_perfil)) {
    throw new Error('Tipo de perfil deve ser ADM ou Usuario.');
  }

  try {
    const atualizado = await usuarioRepository.updatePerfil(userId, dados);
    return atualizado;
  } catch (err) {
    console.error('Use Case Error (atualizarUsuario):', err.message || err);
    throw new Error(`Não foi possível atualizar o usuário. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default atualizarUsuario;
