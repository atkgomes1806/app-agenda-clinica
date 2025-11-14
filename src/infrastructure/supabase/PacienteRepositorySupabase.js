import PacienteRepository from '../../domain/repositories/PacienteRepository.js';
import { supabase } from './client.js';

const TABLE_NAME = 'pacientes';

export class PacienteRepositorySupabase extends PacienteRepository {
  constructor(client = supabase) {
    super();
    this.client = client;
  }

  async fetchPacientes() {
    try {
      // Ordena por nome_completo para a UI
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .select('*')
        .order('nome_completo', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME}]:`, err.message || err);
      // relança como Error genérico (requisito)
      throw new Error(err.message || 'Erro ao buscar pacientes.');
    }
  }

  async fetchAll(options = {}) {
    try {
      const { limit, offset = 0, searchTerm } = options;
      
      let query = this.client
        .from(TABLE_NAME)
        .select('*')
        .order('id', { ascending: false }); // Mais recentes primeiro

      // Aplica filtro de busca se fornecido
      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('nome_completo', `%${searchTerm.trim()}%`);
      }

      // Aplica paginação
      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME}]:`, err.message || err);
      throw new Error(err.message || 'Erro ao buscar pacientes.');
    }
  }

  async createPaciente(dados) {
    try {
      // IMPORTANTE: usar .select() no final para retornar o registro criado
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .insert([dados])
        .select();

      if (error) throw error;
      // supabase retorna um array de registros
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME}]:`, err.message || err);
      throw new Error(err.message || 'Erro ao criar paciente.');
    }
  }

  async updatePaciente(id, dados) {
    try {
      // IMPORTANTE: usar .select() para retornar o objeto atualizado
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .update(dados)
        .eq('id', id)
        .select();

      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME}]:`, err.message || err);
      throw new Error(err.message || 'Erro ao atualizar paciente.');
    }
  }

  async deletePaciente(id) {
    try {
      const { error } = await this.client.from(TABLE_NAME).delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME}]:`, err.message || err);
      throw new Error(err.message || 'Erro ao deletar paciente.');
    }
  }
}

export default PacienteRepositorySupabase;
