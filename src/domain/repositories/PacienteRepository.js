// Interface (abstração) para operações de Pacientes
export class PacienteRepository {
  /**
   * Retorna a lista de pacientes
   * @returns {Promise<Array>} lista de pacientes
   */
  async fetchPacientes() {
    throw new Error('Método fetchPacientes() não implementado.');
  }

  /**
   * Cria um novo paciente
   * @param {Object} dados
   */
  async createPaciente(dados) {
    throw new Error('Método createPaciente() não implementado.');
  }

  /**
   * Atualiza um paciente existente
   * @param {string|number} id
   * @param {Object} dados
   */
  async updatePaciente(id, dados) {
    throw new Error('Método updatePaciente() não implementado.');
  }

  /**
   * Remove um paciente
   * @param {string|number} id
   */
  async deletePaciente(id) {
    throw new Error('Método deletePaciente() não implementado.');
  }
}

export default PacienteRepository;
