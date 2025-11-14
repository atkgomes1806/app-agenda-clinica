/**
 * Interface/Contrato para repositório de Usuários (auth.users + perfis)
 */
export default class UsuarioRepository {
  /**
   * Lista todos os usuários com seus perfis
   * @returns {Promise<Array>} lista de usuários com perfil
   */
  async fetchAll() {
    throw new Error('fetchAll não implementado');
  }

  /**
   * Cria um novo usuário (auth) e seu perfil
   * @param {Object} dados - { email, password, nome, tipo_perfil }
   * @returns {Promise<Object>} usuário criado
   */
  async createUsuario(dados) {
    throw new Error('createUsuario não implementado');
  }

  /**
   * Atualiza dados do perfil de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} dados - { nome, tipo_perfil }
   * @returns {Promise<Object>} perfil atualizado
   */
  async updatePerfil(userId, dados) {
    throw new Error('updatePerfil não implementado');
  }

  /**
   * Deleta um usuário (auth + perfil)
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} sucesso
   */
  async deleteUsuario(userId) {
    throw new Error('deleteUsuario não implementado');
  }

  /**
   * Reseta a senha de um usuário
   * @param {string} userId - ID do usuário
   * @param {string} newPassword - Nova senha
   * @returns {Promise<boolean>} sucesso
   */
  async resetPassword(userId, newPassword) {
    throw new Error('resetPassword não implementado');
  }
}
