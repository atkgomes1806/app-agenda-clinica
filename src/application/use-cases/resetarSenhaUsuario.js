import { usuarioRepository } from '../../infrastructure/config/usuarioInjector.js';

/**
 * Use Case: resetarSenhaUsuario
 * Reseta a senha de um usuário
 * @param {string} userId - ID do usuário
 * @param {string} novaSenha - Nova senha
 */
export async function resetarSenhaUsuario(userId, novaSenha) {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório.');
  }

  if (!novaSenha || String(novaSenha).length < 6) {
    throw new Error('Nova senha deve ter pelo menos 6 caracteres.');
  }

  try {
    const resultado = await usuarioRepository.resetPassword(userId, novaSenha);
    return resultado;
  } catch (err) {
    console.error('Use Case Error (resetarSenhaUsuario):', err.message || err);
    throw new Error(`Não foi possível resetar a senha. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default resetarSenhaUsuario;
