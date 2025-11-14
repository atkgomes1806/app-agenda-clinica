import { useEffect, useState } from 'react';
import listarUsuarios from '../../application/use-cases/listarUsuarios.js';
import criarUsuario from '../../application/use-cases/criarUsuario.js';
import atualizarUsuario from '../../application/use-cases/atualizarUsuario.js';
import deletarUsuario from '../../application/use-cases/deletarUsuario.js';
import resetarSenhaUsuario from '../../application/use-cases/resetarSenhaUsuario.js';
import { supabase } from '../../infrastructure/supabase/client.js';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estado do formulário
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    tipo_perfil: 'Usuario'
  });

  // Estado de reset de senha
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    verificarPermissao();
    carregarUsuarios();
  }, []);

  async function verificarPermissao() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Você precisa estar autenticado.');
        setLoading(false);
        return;
      }

      const { data: perfil } = await supabase
        .from('perfis')
        .select('tipo_perfil')
        .eq('user_id', user.id)
        .single();

      if (perfil?.tipo_perfil === 'ADM') {
        setIsAdmin(true);
      } else {
        setError('Acesso negado. Apenas administradores podem gerenciar usuários.');
      }
    } catch (err) {
      console.error('Erro ao verificar permissão:', err);
      setError('Erro ao verificar permissões.');
    }
  }

  async function carregarUsuarios() {
    setLoading(true);
    setError(null);
    try {
      const lista = await listarUsuarios();
      setUsuarios(lista);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      if (editingUser) {
        // Atualizar usuário existente
        await atualizarUsuario(editingUser.user_id, {
          nome: formData.nome,
          tipo_perfil: formData.tipo_perfil
        });
      } else {
        // Criar novo usuário
        await criarUsuario(formData);
      }

      setShowForm(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', nome: '', tipo_perfil: 'Usuario' });
      carregarUsuarios();
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Erro ao salvar usuário');
    }
  }

  async function handleDelete(userId) {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      await deletarUsuario(userId);
      carregarUsuarios();
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      setError(err.message || 'Erro ao deletar usuário');
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError(null);

    try {
      await resetarSenhaUsuario(resetUserId, newPassword);
      alert('Senha resetada com sucesso!');
      setResetUserId(null);
      setNewPassword('');
    } catch (err) {
      console.error('Erro ao resetar senha:', err);
      setError(err.message || 'Erro ao resetar senha');
    }
  }

  function startEdit(usuario) {
    setEditingUser(usuario);
    setFormData({
      email: '', // Não permite editar email
      password: '',
      nome: usuario.nome,
      tipo_perfil: usuario.tipo_perfil
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ email: '', password: '', nome: '', tipo_perfil: 'Usuario' });
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ color: 'red' }}>{error || 'Carregando...'}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Gerenciamento de Usuários</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)}>
            + Novo Usuário
          </button>
        )}
      </div>

      {error && (
        <div style={{ 
          padding: 12, 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: 4, 
          marginBottom: 16 
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: 24, 
          borderRadius: 8, 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: 24 
        }}>
          <h2>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <form onSubmit={handleSubmit}>
            {!editingUser && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {!editingUser && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Senha * (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Tipo de Perfil *
              </label>
              <select
                value={formData.tipo_perfil}
                onChange={(e) => setFormData({ ...formData, tipo_perfil: e.target.value })}
                required
                style={{ width: '100%' }}
              >
                <option value="Usuario">Usuário</option>
                <option value="ADM">Administrador</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit">
                {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
              <button 
                type="button" 
                onClick={cancelForm}
                style={{ backgroundColor: '#6c757d' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Carregando usuários...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo de Perfil</th>
                <th>ID</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#666' }}>
                    Nenhum usuário cadastrado
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.user_id}>
                    <td>{usuario.nome}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: usuario.tipo_perfil === 'ADM' ? '#e3f2fd' : '#f5f5f5',
                        color: usuario.tipo_perfil === 'ADM' ? '#1976d2' : '#666',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {usuario.tipo_perfil}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#666' }}>
                      {usuario.user_id.substring(0, 8)}...
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => startEdit(usuario)}
                          style={{ 
                            padding: '4px 12px', 
                            fontSize: '12px',
                            backgroundColor: '#28a745'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setResetUserId(usuario.user_id)}
                          style={{ 
                            padding: '4px 12px', 
                            fontSize: '12px',
                            backgroundColor: '#ffc107',
                            color: '#000'
                          }}
                        >
                          Resetar Senha
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.user_id)}
                          style={{ 
                            padding: '4px 12px', 
                            fontSize: '12px',
                            backgroundColor: '#dc3545'
                          }}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {resetUserId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 24,
            borderRadius: 8,
            maxWidth: 400,
            width: '100%'
          }}>
            <h3 style={{ marginBottom: 16 }}>Resetar Senha</h3>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Nova Senha (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit">Confirmar</button>
                <button 
                  type="button"
                  onClick={() => {
                    setResetUserId(null);
                    setNewPassword('');
                  }}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
