// Interface para Profissionais
export class ProfissionaisRepository {
  /**
   * Busca todos os profissionais com filtros opcionais
   * @param {Object} options - { limit, offset, searchTerm }
   * @returns {Promise<Array>} lista de profissionais
   */
  async fetchAll(options = {}) {
    throw new Error('Método fetchAll() não implementado.');
  }

  /**
   * Cria um novo profissional
   * @param {Object} dados - { nome, tipo_terapia_id }
   * @returns {Promise<Object>} profissional criado
   */
  async create(dados) {
    throw new Error('Método create() não implementado.');
  }

  /**
   * Atualiza um profissional
   * @param {string} id
   * @param {Object} dados
   * @returns {Promise<Object>} profissional atualizado
   */
  async update(id, dados) {
    throw new Error('Método update() não implementado.');
  }

  /**
   * Exclui um profissional
   * @param {string} id
   * @returns {Promise<boolean>} sucesso
   */
  async delete(id) {
    throw new Error('Método delete() não implementado.');
  }
}

export default ProfissionaisRepository;
