// Interface para Tipos de Terapia
export class TiposTerapiaRepository {
  /**
   * Busca todos os tipos de terapia com filtros opcionais
   * @param {Object} options - { limit, offset, searchTerm }
   * @returns {Promise<Array>} lista de tipos de terapia
   */
  async fetchAll(options = {}) {
    throw new Error('Método fetchAll() não implementado.');
  }

  /**
   * Cria um novo tipo de terapia
   * @param {Object} dados - { nome_terapia, tempo_sessao_minutos }
   * @returns {Promise<Object>} tipo de terapia criado
   */
  async create(dados) {
    throw new Error('Método create() não implementado.');
  }

  /**
   * Atualiza um tipo de terapia
   * @param {string} id
   * @param {Object} dados
   */
  async update(id, dados) {
    throw new Error('Método update() não implementado.');
  }

  /**
   * Exclui um tipo de terapia
   * @param {string} id
   */
  async delete(id) {
    throw new Error('Método delete() não implementado.');
  }
}

export default TiposTerapiaRepository;
