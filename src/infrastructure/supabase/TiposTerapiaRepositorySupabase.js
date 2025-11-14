import TiposTerapiaRepository from '../../domain/repositories/TiposTerapiaRepository.js';
import { supabase } from './client.js';

const TABLE_NAME = 'tipos_terapia';

export class TiposTerapiaRepositorySupabase extends TiposTerapiaRepository {
  constructor(client = supabase) {
    super();
    this.client = client;
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
        query = query.ilike('nome_terapia', `%${searchTerm.trim()}%`);
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
      throw new Error(err.message || 'Erro ao buscar tipos de terapia.');
    }
  }

  async create(dados) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .insert([dados])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - create]:`, err.message || err);
      throw new Error(err.message || 'Erro ao criar tipo de terapia.');
    }
  }

  async update(id, dados) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .update(dados)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - update]:`, err.message || err);
      throw new Error(err.message || 'Erro ao atualizar tipo de terapia.');
    }
  }

  async delete(id) {
    try {
      const { error } = await this.client
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - delete]:`, err.message || err);
      if (String(err.message).includes('violates foreign key')) {
        throw new Error('Não é possível excluir: tipo de terapia possui planos vinculados.');
      }
      throw new Error(err.message || 'Erro ao excluir tipo de terapia.');
    }
  }
}

export default TiposTerapiaRepositorySupabase;
