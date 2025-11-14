import { usuarioRepository } from '../../infrastructure/config/usuarioInjector.js';

/**
 * Use Case: criarUsuario
 * Valida e cria um novo usuário com perfil
 * @param {Object} dados - { email, password, nome, tipo_perfil }
 */
export async function criarUsuario(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new Error('Dados do usuário são obrigatórios.');
  }

  const { email, password, nome, tipo_perfil } = dados;

  // Validações
  if (!email || String(email).trim() === '') {
    throw new Error('Email é obrigatório.');
  }

  if (!password || String(password).length < 6) {
    throw new Error('Senha deve ter pelo menos 6 caracteres.');
  }

  if (!nome || String(nome).trim() === '') {
    throw new Error('Nome é obrigatório.');
  }

  if (tipo_perfil && !['ADM', 'Usuario'].includes(tipo_perfil)) {
    throw new Error('Tipo de perfil deve ser ADM ou Usuario.');
  }

  try {
    const novoUsuario = await usuarioRepository.createUsuario({
      email,
      password,
      nome,
      tipo_perfil: tipo_perfil || 'Usuario'
    });

    return novoUsuario;
  } catch (err) {
    console.error('Use Case Error (criarUsuario):', err.message || err);
    throw new Error(`Não foi possível criar o usuário. Detalhe: ${err.message || 'erro desconhecido'}`);
  }
}

export default criarUsuario;
