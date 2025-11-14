import UsuarioRepository from '../../domain/repositories/UsuarioRepository.js';
import { supabase } from './client.js';

export class UsuarioRepositorySupabase extends UsuarioRepository {
  constructor(client = supabase) {
    super();
    this.client = client;
  }

  async fetchAll() {
    try {
      // Busca todos os perfis (que têm FK para auth.users)
      const { data, error } = await this.client
        .from('perfis')
        .select('user_id, nome, tipo_perfil')
        .order('nome', { ascending: true });

      if (error) throw error;

      // Para cada perfil, busca o email do auth.users via admin API
      // Nota: Esta operação requer privilégios de admin no Supabase
      // Como não temos acesso direto ao auth.users via select, retornamos só o perfil
      // O email pode ser obtido via supabase.auth.admin.getUserById() se tiver service_role key

      return data || [];
    } catch (err) {
      console.error('Supabase Error [perfis - fetchAll]:', err.message || err);
      throw new Error(err.message || 'Erro ao buscar usuários.');
    }
  }

  async createUsuario(dados) {
    try {
      const { email, password, nome, tipo_perfil } = dados;

      if (!email || !password || !nome) {
        throw new Error('Email, senha e nome são obrigatórios.');
      }

      // Guarda a sessão atual do admin antes de criar o novo usuário
      const { data: { session: adminSession } } = await this.client.auth.getSession();

      if (!adminSession) {
        throw new Error('Você precisa estar autenticado como admin para criar usuários.');
      }

      // Passo 1: Criar o usuário no Supabase Auth
      // Nota: signUp() cria E autentica o novo usuário automaticamente
      const { data: authData, error: authError } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: nome,
          }
        }
      });

      // Se o erro for "User already registered", pode ser um usuário órfão (sem perfil)
      if (authError) {
        if (authError.message && authError.message.includes('User already registered')) {
          // Usuário existe no auth mas pode não ter perfil
          // Tenta buscar o usuário pelo email para obter o ID
          // Nota: Isso requer uma abordagem diferente pois não temos acesso direto ao auth.users
          throw new Error('Este email já está cadastrado no sistema. Se o usuário não aparece na lista, entre em contato com o suporte técnico para resolver o problema.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado no Auth.');
      }

      const newUserId = authData.user.id;

      // Passo 2: Restaurar a sessão do admin para poder chamar a função RPC
      await this.client.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token
      });

      // Aguarda um pouco para garantir que a sessão foi restaurada
      await new Promise(resolve => setTimeout(resolve, 100));

      // Passo 3: Criar o perfil usando a função RPC que bypassa RLS
      // Esta função verifica se o usuário atual (admin) tem permissão
      const { data: perfilData, error: perfilError } = await this.client
        .rpc('criar_perfil_por_admin', {
          p_user_id: newUserId,
          p_nome: nome,
          p_tipo_perfil: tipo_perfil || 'Usuario'
        });

      if (perfilError) {
        console.error('Erro ao criar perfil via RPC:', perfilError);
        // Nota: O usuário auth foi criado mas sem perfil
        throw new Error(`Usuário foi criado no sistema de autenticação, mas houve um erro ao criar o perfil. Erro: ${perfilError.message || 'erro desconhecido'}. Entre em contato com o suporte técnico.`);
      }

      return {
        user_id: newUserId,
        email: authData.user.email,
        nome: nome,
        tipo_perfil: tipo_perfil || 'Usuario'
      };
    } catch (err) {
      console.error('Supabase Error [createUsuario]:', err.message || err);
      throw new Error(err.message || 'Erro ao criar usuário.');
    }
  }

  async updatePerfil(userId, dados) {
    try {
      const { data, error } = await this.client
        .from('perfis')
        .update(dados)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Supabase Error [updatePerfil]:', err.message || err);
      throw new Error(err.message || 'Erro ao atualizar perfil.');
    }
  }

  async deleteUsuario(userId) {
    try {
      // Deleta o perfil (o usuário auth precisa ser deletado via admin API)
      const { error: perfilError } = await this.client
        .from('perfis')
        .delete()
        .eq('user_id', userId);

      if (perfilError) throw perfilError;

      // Nota: Para deletar do auth.users, precisa usar supabase.auth.admin.deleteUser()
      // que requer service_role key. Por ora, apenas deletamos o perfil.
      // Idealmente, crie uma função RPC no Postgres para isso.

      return true;
    } catch (err) {
      console.error('Supabase Error [deleteUsuario]:', err.message || err);
      throw new Error(err.message || 'Erro ao deletar usuário.');
    }
  }

  async resetPassword(userId, newPassword) {
    try {
      // Atualização de senha requer admin API com service_role key
      // Por ora, retornamos um placeholder
      // Idealmente: await supabase.auth.admin.updateUserById(userId, { password: newPassword })
      
      throw new Error('Reset de senha requer implementação com service_role key via RPC ou Admin API.');
    } catch (err) {
      console.error('Supabase Error [resetPassword]:', err.message || err);
      throw new Error(err.message || 'Erro ao resetar senha.');
    }
  }
}

export default UsuarioRepositorySupabase;
