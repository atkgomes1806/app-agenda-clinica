// Interface/Contrato para o repositório de PlanoSessao
export class PlanoSessaoRepository {
  /**
   * Cria um novo plano de sessão
   * @param {Object} dados - { paciente_id, profissional_id, tipo_terapia_id, dia_semana, hora_inicio, hora_fim, ativo, usuario_criacao_id }
   * @returns {Promise<Object>} objeto criado
   */
  async createPlanoSessao(dados) {
    throw new Error('Método createPlanoSessao() não implementado.');
  }

  /**
   * Retorna os planos ativos (para geração de agenda)
   * @returns {Promise<Array>} lista de planos com dados do paciente/profissional/tipo
   */
  async fetchPlanosAtivos() {
    throw new Error('Método fetchPlanosAtivos() não implementado.');
  }

  /**
   * Atualiza um plano de sessão existente
   * @param {string} id
   * @param {Object} dados
   * @returns {Promise<Object>} objeto atualizado
   */
  async updatePlanoSessao(id, dados) {
    throw new Error('Método updatePlanoSessao() não implementado.');
  }

  /**
   * Remove um plano de sessão pelo id
   * @param {string} id
   * @returns {Promise<Object|boolean>} registro deletado ou true
   */
  async deletePlanoSessao(id) {
    throw new Error('Método deletePlanoSessao() não implementado.');
  }

  /**
   * Retorna dados agregados de ocupação por profissional
   * @returns {Promise<Array<{profissional_id: string, total_sessao_minutos: number, contagem_sessao: number}>>}
   */
  async fetchTaxaOcupacao() {
    throw new Error('Método fetchTaxaOcupacao() não implementado.');
  }
}

export default PlanoSessaoRepository;
