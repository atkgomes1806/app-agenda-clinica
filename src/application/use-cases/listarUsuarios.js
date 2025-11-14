import { usuarioRepository } from '../../infrastructure/config/usuarioInjector.js';

/**
 * Use Case: listarUsuarios
 * Retorna lista de todos os usuários com seus perfis
 */
export async function listarUsuarios() {
  try {
    const usuarios = await usuarioRepository.fetchAll();
    return usuarios;
  } catch (err) {
    console.error('Use Case Error (listarUsuarios):', err.message || err);
    throw new Error('Não foi possível listar os usuários.');
  }
}

export default listarUsuarios;
