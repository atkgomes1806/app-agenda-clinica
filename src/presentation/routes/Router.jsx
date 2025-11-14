import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../../infrastructure/supabase/client.js';
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const CadastroGeralPage = lazy(() => import('../pages/CadastroGeralPage.jsx'));
const AgendaPage = lazy(() => import('../pages/AgendaPage.jsx'));
const NovoPlanoSessaoPage = lazy(() => import('../pages/NovoPlanoSessaoPage.jsx'));
const RelatorioOcupacaoPage = lazy(() => import('../pages/RelatorioOcupacaoPage.jsx'));
const UsuariosPage = lazy(() => import('../pages/UsuariosPage.jsx'));

// Componente de Layout com navegação
function Layout({ children, user, perfil }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div>
      <nav style={{ 
        padding: 16, 
        borderBottom: '2px solid #ddd',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/agenda" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 500 }}>
            Agenda
          </Link>
          <Link to="/cadastro" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 500 }}>
            Cadastro
          </Link>
          <Link to="/planos/novo" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 500 }}>
            Novo Plano
          </Link>
          <Link to="/relatorios/ocupacao" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 500 }}>
            Relatórios de Atendimentos
          </Link>
          {perfil?.tipo_perfil === 'ADM' && (
            <Link to="/usuarios" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 500 }}>
              Usuários
            </Link>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {perfil?.nome || user?.email}
            {perfil?.tipo_perfil === 'ADM' && (
              <span style={{ 
                marginLeft: 8, 
                padding: '2px 8px', 
                backgroundColor: '#e3f2fd', 
                color: '#1976d2',
                borderRadius: 4,
                fontSize: '12px',
                fontWeight: 500
              }}>
                ADM
              </span>
            )}
          </span>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#dc3545',
              fontSize: '14px'
            }}
          >
            Sair
          </button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

// Componente de rota protegida
function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    checkUser();

    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadPerfil(session.user.id);
      } else {
        setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadPerfil(user.id);
      }
    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPerfil(userId) {
    try {
      const { data } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', userId)
        .single();
      setPerfil(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout user={user} perfil={perfil}>{children}</Layout>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: 24 }}>Carregando...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/agenda" replace />} />
          <Route 
            path="/cadastro" 
            element={
              <ProtectedRoute>
                <CadastroGeralPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agenda" 
            element={
              <ProtectedRoute>
                <AgendaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/planos/novo" 
            element={
              <ProtectedRoute>
                <NovoPlanoSessaoPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/relatorios/ocupacao" 
            element={
              <ProtectedRoute>
                <RelatorioOcupacaoPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute>
                <UsuariosPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
