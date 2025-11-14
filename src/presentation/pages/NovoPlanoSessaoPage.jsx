import { useEffect, useState, useMemo } from 'react';
import PlanoSessaoForm from '../components/PlanoSessaoForm.jsx';
import listarPacientes from '../../application/use-cases/listarPacientes.js';
import listarProfissionais from '../../application/use-cases/listarProfissionais.js';
import listarTiposTerapia from '../../application/use-cases/listarTiposTerapia.js';
import listarPlanosSessaoAtivos from '../../application/use-cases/listarPlanosSessaoAtivos.js';
import criarPlanoSessao from '../../application/use-cases/criarPlanoSessao.js';
import atualizarPlanoSessao from '../../application/use-cases/atualizarPlanoSessao.js';
import deletarPlanoSessao from '../../application/use-cases/deletarPlanoSessao.js';
import { supabase } from '../../infrastructure/supabase/client.js';

export default function NovoPlanoSessaoPage() {
  const [pacientes, setPacientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlanos, setLoadingPlanos] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userId, setUserId] = useState(null);
  const [editingPlano, setEditingPlano] = useState(null);
  const [editError, setEditError] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        if (user) {
          setUserId(user.id);
        } else {
          setError('Usuário não autenticado. Faça login para criar planos de sessão.');
          setLoading(false);
          return;
        }
        const [p, pr, t] = await Promise.all([listarPacientes(), listarProfissionais(), listarTiposTerapia()]);
        if (!mounted) return;
        setPacientes(p || []);
        setProfissionais(pr || []);
        setTipos(t || []);
        await carregarPlanos();
      } catch (err) {
        console.error('Erro ao carregar dados para NovoPlanoSessaoPage', err);
        if (mounted) setError(err.message || 'Erro ao carregar dados');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function carregarPlanos() {
    setLoadingPlanos(true);
    try {
      const lista = await listarPlanosSessaoAtivos();
      setPlanos(lista);
    } catch (err) {
      console.error('Erro ao listar planos', err);
    } finally {
      setLoadingPlanos(false);
    }
  }

  async function handleCreate(payload) {
    setError(null);
    setSuccess(null);
    try {
      const payloadCompleto = { ...payload, usuario_criacao_id: userId };
      const novo = await criarPlanoSessao(payloadCompleto);
      setSuccess('Plano de sessão criado com sucesso.');
      await carregarPlanos();
      return novo;
    } catch (err) {
      console.error('Erro ao criar plano de sessão', err);
      setError(err.message || 'Erro ao criar plano de sessão');
      throw err;
    }
  }

  function formatHora(h) { return h?.slice(0,5); }
  function diaLabel(d) { const map = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']; return map[d] ?? d; }

  const planosAgrupados = useMemo(() => {
    const grupos = {};
    for (const p of planos) {
      const key = p.tipo_terapia_nome || 'Sem Tipo';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(p);
    }
    return grupos;
  }, [planos]);

  function abrirEdicao(plano) {
    setEditingPlano(plano);
    setEditError(null);
  }

  async function salvarEdicao() {
    if (!editingPlano) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const { id, hora_inicio, hora_fim, dia_semana } = editingPlano;
      await atualizarPlanoSessao(id, { hora_inicio, hora_fim, dia_semana });
      setEditingPlano(null);
      await carregarPlanos();
    } catch (err) {
      setEditError(err.message || 'Erro ao salvar alterações');
    } finally {
      setSavingEdit(false);
    }
  }

  async function excluirPlano(id) {
    const ok = window.confirm('Deseja realmente excluir este plano?');
    if (!ok) return;
    try {
      await deletarPlanoSessao(id);
      await carregarPlanos();
    } catch (err) {
      alert(err.message || 'Erro ao excluir');
    }
  }

  if (loading) return <div>Carregando formulários...</div>;
  if (error) return <div style={{ color: 'red' }}>Erro: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 24 }}>Novo Plano de Sessão</h1>
      {success && <div style={{ color: 'green', marginBottom: 16 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      <div style={{ marginBottom: 32 }}>
        <PlanoSessaoForm
          pacientesList={pacientes}
          profissionaisList={profissionais}
          tiposTerapiaList={tipos}
          handleCreate={handleCreate}
        />
      </div>

      <h2 style={{ marginBottom: 16 }}>Planos Ativos por Tipo de Terapia</h2>
      {loadingPlanos ? (
        <div>Carregando planos...</div>
      ) : Object.keys(planosAgrupados).length === 0 ? (
        <div style={{ color: '#666' }}>Nenhum plano cadastrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(planosAgrupados).map(([tipoNome, lista]) => (
            <div key={tipoNome} style={{ background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>{tipoNome}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ textAlign: 'left', padding: 8 }}>Paciente</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Profissional</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Dia</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Início</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Fim</th>
                    <th style={{ padding: 8 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.sort((a,b)=> (a.dia_semana - b.dia_semana) || a.hora_inicio.localeCompare(b.hora_inicio)).map(plano => (
                    <tr key={plano.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: 8 }}>{plano.paciente_nome_completo || plano.paciente_id?.slice(0,8)}</td>
                      <td style={{ padding: 8 }}>{plano.profissional_nome || plano.profissional_id?.slice(0,8)}</td>
                      <td style={{ padding: 8 }}>{diaLabel(plano.dia_semana)}</td>
                      <td style={{ padding: 8 }}>{formatHora(plano.hora_inicio)}</td>
                      <td style={{ padding: 8 }}>{formatHora(plano.hora_fim)}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => abrirEdicao(plano)} style={{ marginRight: 8, backgroundColor: '#007bff' }}>Editar</button>
                        <button onClick={() => excluirPlano(plano.id)} style={{ backgroundColor: '#dc3545' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {editingPlano && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, width: 420, maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Editar Plano</h3>
            {editError && <div style={{ color: 'red', marginBottom: 12 }}>{editError}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>Dia da Semana</label>
                <select
                  value={editingPlano.dia_semana}
                  onChange={(e) => setEditingPlano({ ...editingPlano, dia_semana: Number(e.target.value) })}
                  style={{ width: '100%' }}
                >
                  <option value={1}>Segunda</option>
                  <option value={2}>Terça</option>
                  <option value={3}>Quarta</option>
                  <option value={4}>Quinta</option>
                  <option value={5}>Sexta</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Hora Início</label>
                  <input
                    type="time"
                    value={editingPlano.hora_inicio.slice(0,5)}
                    onChange={(e) => setEditingPlano({ ...editingPlano, hora_inicio: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Hora Fim</label>
                  <input
                    type="time"
                    value={editingPlano.hora_fim.slice(0,5)}
                    onChange={(e) => setEditingPlano({ ...editingPlano, hora_fim: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button onClick={() => setEditingPlano(null)} disabled={savingEdit} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
                <button onClick={salvarEdicao} disabled={savingEdit} style={{ backgroundColor: '#28a745' }}>{savingEdit ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
