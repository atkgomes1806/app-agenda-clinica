import { usuarioRepository } from '../../infrastructure/config/usuarioInjector.js';

/**
 * Use Case: deletarUsuario
 * Deleta um usuário e seu perfil
 * @param {string} userId - ID do usuário
 */
export async function deletarUsuario(userId) {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório.');
  }

  try {
    const resultado = await usuarioRepository.deleteUsuario(userId);
    return resultado;
  } catch (err) {
    console.error('Use Case Error (deletarUsuario):', err.message || err);
    throw new Error(`Não foi possível deletar o usuário. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default deletarUsuario;
