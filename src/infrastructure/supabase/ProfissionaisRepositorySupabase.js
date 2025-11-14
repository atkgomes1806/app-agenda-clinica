import ProfissionaisRepository from '../../domain/repositories/ProfissionaisRepository.js';
import { supabase } from './client.js';

const TABLE_NAME = 'profissionais';

export class ProfissionaisRepositorySupabase extends ProfissionaisRepository {
  constructor(client = supabase) {
    super();
    this.client = client;
  }

  async fetchAll(options = {}) {
    try {
      const { limit, offset = 0, searchTerm } = options;
      
      let query = this.client
        .from(TABLE_NAME)
        .select('*, tipos_terapia(id, nome_terapia)')
        .order('id', { ascending: false }); // Mais recentes primeiro

      // Aplica filtro de busca se fornecido
      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('nome', `%${searchTerm.trim()}%`);
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
      throw new Error(err.message || 'Erro ao buscar profissionais.');
    }
  }

  async create(dados) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .insert([dados])
        .select('*, tipos_terapia(id, nome_terapia)')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - create]:`, err.message || err);
      throw new Error(err.message || 'Erro ao criar profissional.');
    }
  }

  async update(id, dados) {
    try {
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .update(dados)
        .eq('id', id)
        .select('*, tipos_terapia(id, nome_terapia)')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - update]:`, err.message || err);
      throw new Error(err.message || 'Erro ao atualizar profissional.');
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
      // Mensagem amigável caso haja FK (plano_sessao)
      if (String(err.message).includes('violates foreign key')) {
        throw new Error('Não é possível excluir: profissional possui planos vinculados.');
      }
      throw new Error(err.message || 'Erro ao excluir profissional.');
    }
  }
}

export default ProfissionaisRepositorySupabase;
