import PlanoSessaoRepository from '../../domain/repositories/PlanoSessaoRepository.js';
import { supabase } from './client.js';

const TABLE_NAME = 'plano_sessao';

export class PlanoSessaoRepositorySupabase extends PlanoSessaoRepository {
  constructor(client = supabase) {
    super();
    this.client = client;
  }

  async createPlanoSessao(dados) {
    try {
      // Verificar conflitos de horário para o mesmo profissional no mesmo dia
      const { data: conflitos, error: errorConflito } = await this.client
        .from(TABLE_NAME)
        .select('id, paciente_id, hora_inicio, hora_fim')
        .eq('profissional_id', dados.profissional_id)
        .eq('dia_semana', dados.dia_semana)
        .eq('ativo', true);

      if (errorConflito) throw errorConflito;

      if (conflitos && conflitos.length > 0) {
        // Verificar sobreposição de horários
        const horaInicioNova = dados.hora_inicio;
        const horaFimNova = dados.hora_fim;

        for (const plano of conflitos) {
          const horaInicioExistente = plano.hora_inicio;
          const horaFimExistente = plano.hora_fim;

          // Verifica se há sobreposição de horários
          // Sobreposição ocorre se: (inicio1 < fim2) AND (inicio2 < fim1)
          if (horaInicioNova < horaFimExistente && horaInicioExistente < horaFimNova) {
            throw new Error(
              `Conflito de horário: O profissional já possui uma sessão agendada neste dia e horário (${horaInicioExistente} - ${horaFimExistente}).`
            );
          }
        }
      }

      // Usa array no insert e .select() para retornar o registro criado
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .insert([dados])
        .select();

      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME}]:`, err.message || err);
      throw new Error(err.message || 'Erro ao criar plano de sessão.');
    }
  }

  async updatePlanoSessao(id, dados) {
    try {
      // Remove todos os campos de timestamp que podem não existir na tabela
      const { created_at, updated_at, editado_em, criado_em, ...dadosLimpos } = dados;
      
      // Verificar conflitos de horário se estiver alterando profissional, dia ou horários
      if (dadosLimpos.profissional_id || dadosLimpos.dia_semana || dadosLimpos.hora_inicio || dadosLimpos.hora_fim) {
        // Buscar o plano atual para ter dados completos
        const { data: planoAtual, error: errorAtual } = await this.client
          .from(TABLE_NAME)
          .select('profissional_id, dia_semana, hora_inicio, hora_fim, ativo')
          .eq('id', id)
          .single();

        if (errorAtual) throw errorAtual;

        // Mesclar dados atuais com novos dados
        const dadosCompletos = {
          profissional_id: dadosLimpos.profissional_id || planoAtual.profissional_id,
          dia_semana: dadosLimpos.dia_semana !== undefined ? dadosLimpos.dia_semana : planoAtual.dia_semana,
          hora_inicio: dadosLimpos.hora_inicio || planoAtual.hora_inicio,
          hora_fim: dadosLimpos.hora_fim || planoAtual.hora_fim,
          ativo: dadosLimpos.ativo !== undefined ? dadosLimpos.ativo : planoAtual.ativo
        };

        // Só verificar conflitos se o plano estiver ativo
        if (dadosCompletos.ativo) {
          const { data: conflitos, error: errorConflito } = await this.client
            .from(TABLE_NAME)
            .select('id, paciente_id, hora_inicio, hora_fim')
            .eq('profissional_id', dadosCompletos.profissional_id)
            .eq('dia_semana', dadosCompletos.dia_semana)
            .eq('ativo', true)
            .neq('id', id); // Excluir o próprio registro

          if (errorConflito) throw errorConflito;

          if (conflitos && conflitos.length > 0) {
            const horaInicioNova = dadosCompletos.hora_inicio;
            const horaFimNova = dadosCompletos.hora_fim;

            for (const plano of conflitos) {
              const horaInicioExistente = plano.hora_inicio;
              const horaFimExistente = plano.hora_fim;

              // Verifica sobreposição de horários
              if (horaInicioNova < horaFimExistente && horaInicioExistente < horaFimNova) {
                throw new Error(
                  `Conflito de horário: O profissional já possui uma sessão agendada neste dia e horário (${horaInicioExistente} - ${horaFimExistente}).`
                );
              }
            }
          }
        }
      }

      const { data, error } = await this.client
        .from(TABLE_NAME)
        .update(dadosLimpos)
        .eq('id', id)
        .select();

      if (error) throw error;
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - updatePlanoSessao]:`, err.message || err);
      throw new Error(err.message || 'Erro ao atualizar plano de sessão.');
    }
  }

  async deletePlanoSessao(id) {
    try {
      // Retorna o registro deletado (se necessário)
      const { data, error } = await this.client.from(TABLE_NAME).delete().eq('id', id).select();
      if (error) throw error;
      return Array.isArray(data) ? data[0] : data || true;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - deletePlanoSessao]:`, err.message || err);
      throw new Error(err.message || 'Erro ao deletar plano de sessão.');
    }
  }

  async fetchTaxaOcupacao() {
    try {
      // Chama a função RPC do Postgres que agrega ocupação por profissional
      // A função get_ocupacao_profissional deve estar criada no banco
      const { data, error } = await this.client.rpc('get_ocupacao_profissional');
      if (error) throw error;

      // Esperamos um array de objetos com { profissional_id, total_sessao_minutos, contagem_sessao }
      return data || [];
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - fetchTaxaOcupacao]:`, err.message || err);
      throw new Error(err.message || 'Erro ao buscar taxa de ocupação.');
    }
  }

  async fetchPlanosAtivos() {
    try {
      // Seleciona planos ativos e faz join com pacientes, profissionais e tipos_terapia
      // Supabase permite selecionar relacionamentos via sintaxe: foreign_table(column)
      const { data, error } = await this.client
        .from(TABLE_NAME)
        .select(
          `*, pacientes (nome_completo), profissionais (nome), tipos_terapia (nome_terapia)`
        )
        .eq('ativo', true);

      if (error) throw error;

      // Normaliza/achata alguns campos para facilitar o Use Case
      const normalized = (data || []).map((p) => ({
        ...p,
        paciente_nome_completo: p.pacientes && p.pacientes.nome_completo ? p.pacientes.nome_completo : null,
        profissional_nome: p.profissionais && p.profissionais.nome ? p.profissionais.nome : null,
        tipo_terapia_nome: p.tipos_terapia && p.tipos_terapia.nome_terapia ? p.tipos_terapia.nome_terapia : null,
      }));

      return normalized;
    } catch (err) {
      console.error(`Supabase Error [${TABLE_NAME} - fetchPlanosAtivos]:`, err.message || err);
      throw new Error(err.message || 'Erro ao buscar planos ativos.');
    }
  }
}

export default PlanoSessaoRepositorySupabase;
