import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../infrastructure/supabase/client.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data?.user;
      if (!user) {
        throw new Error('Falha ao obter usuário autenticado.');
      }

      // 1) Tenta buscar perfil existente
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!perfilError && perfil) {
        // Perfil existe: segue para a aplicação
        navigate('/agenda');
        return;
      }

      // 2) Se não existir, tenta criar perfil padrão (Usuario) para primeiro acesso
      const nomeInferido = user.user_metadata?.nome || (user.email ? user.email.split('@')[0] : 'Usuário');
      const { error: insertPerfilError } = await supabase
        .from('perfis')
        .insert([{ user_id: user.id, nome: nomeInferido, tipo_perfil: 'Usuario' }]);

      if (insertPerfilError) {
        console.error('Erro ao criar perfil automaticamente:', insertPerfilError);
        // Mantém usuário autenticado, mas informa necessidade de ajuste das policies RLS
        setError('Usuário sem perfil configurado e criação automática bloqueada pela política de segurança. Solicite ao administrador para ajustar as policies RLS e criar seu perfil.');
        return;
      }

      // Perfil criado com sucesso: segue para a aplicação
      navigate('/agenda');
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '8px', textAlign: 'center' }}>Clínica TEA</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>
          Sistema de Gerenciamento de Agenda
        </p>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="seu@email.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
