import { useState, useEffect } from 'react';
import listarPacientes from '../../application/use-cases/listarPacientes.js';
import listarProfissionais from '../../application/use-cases/listarProfissionais.js';
import listarTiposTerapia from '../../application/use-cases/listarTiposTerapia.js';
import NovoPacienteModal from '../components/NovoPacienteModal.jsx';
import NovoProfissionalModal from '../components/NovoProfissionalModal.jsx';
import NovoTipoTerapiaModal from '../components/NovoTipoTerapiaModal.jsx';
import EditarPacienteModal from '../components/EditarPacienteModal.jsx';
import EditarProfissionalModal from '../components/EditarProfissionalModal.jsx';
import EditarTipoTerapiaModal from '../components/EditarTipoTerapiaModal.jsx';
import excluirPaciente from '../../application/use-cases/excluirPaciente.js';
import excluirProfissional from '../../application/use-cases/excluirProfissional.js';
import excluirTipoTerapia from '../../application/use-cases/excluirTipoTerapia.js';

// Componente de Seção CRUD Light
function CRUDLightSection({ 
  title, 
  items, 
  loading, 
  error, 
  searchTerm, 
  onSearchChange, 
  onAddClick,
  renderItem 
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: 24,
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flex: 1,
      minWidth: 300
    }}>
      {/* Cabeçalho */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>{title}</h2>
        <button
          onClick={onAddClick}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span>
          Novo
        </button>
      </div>

      {/* Campo de Busca */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder={`Buscar ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ 
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4
          }}
        />
      </div>

      {/* Lista de Itens */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 16, color: '#666' }}>
          Carregando...
        </div>
      ) : error ? (
        <div style={{ 
          padding: 12, 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: 4 
        }}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
          {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum registro ainda'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                padding: 12,
                border: '1px solid #e0e0e0',
                borderRadius: 4,
                backgroundColor: '#fafafa',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CadastroGeralPage() {
  // Estados dos Modais
  const [modalPaciente, setModalPaciente] = useState(false);
  const [modalProfissional, setModalProfissional] = useState(false);
  const [modalTerapia, setModalTerapia] = useState(false);
  const [editarPaciente, setEditarPaciente] = useState(null);
  const [editarProfissional, setEditarProfissional] = useState(null);
  const [editarTerapia, setEditarTerapia] = useState(null);

  // Estados de Pacientes
  const [pacientes, setPacientes] = useState([]);
  const [pacientesLoading, setPacientesLoading] = useState(false);
  const [pacientesError, setPacientesError] = useState(null);
  const [pacienteSearch, setPacienteSearch] = useState('');

  // Estados de Profissionais
  const [profissionais, setProfissionais] = useState([]);
  const [profissionaisLoading, setProfissionaisLoading] = useState(false);
  const [profissionaisError, setProfissionaisError] = useState(null);
  const [profissionalSearch, setProfissionalSearch] = useState('');

  // Estados de Tipos de Terapia
  const [tiposTerapia, setTiposTerapia] = useState([]);
  const [terapiasLoading, setTerapiasLoading] = useState(false);
  const [terapiasError, setTerapiasError] = useState(null);
  const [terapiaSearch, setTerapiaSearch] = useState('');

  // Carregamento inicial
  useEffect(() => {
    carregarPacientes();
    carregarProfissionais();
    carregarTiposTerapia();
  }, []);

  // Re-carrega quando o termo de busca muda (debounce poderia ser aplicado aqui)
  useEffect(() => {
    carregarPacientes();
  }, [pacienteSearch]);

  useEffect(() => {
    carregarProfissionais();
  }, [profissionalSearch]);

  useEffect(() => {
    carregarTiposTerapia();
  }, [terapiaSearch]);

  // Funções de Carregamento
  async function carregarPacientes() {
    setPacientesLoading(true);
    setPacientesError(null);
    try {
      const lista = await listarPacientes({ 
        limit: 5, 
        searchTerm: pacienteSearch 
      });
      setPacientes(lista);
    } catch (err) {
      setPacientesError(err.message || 'Erro ao carregar pacientes');
    } finally {
      setPacientesLoading(false);
    }
  }

  async function carregarProfissionais() {
    setProfissionaisLoading(true);
    setProfissionaisError(null);
    try {
      const lista = await listarProfissionais({ 
        limit: 5, 
        searchTerm: profissionalSearch 
      });
      setProfissionais(lista);
    } catch (err) {
      setProfissionaisError(err.message || 'Erro ao carregar profissionais');
    } finally {
      setProfissionaisLoading(false);
    }
  }

  async function carregarTiposTerapia() {
    setTerapiasLoading(true);
    setTerapiasError(null);
    try {
      const lista = await listarTiposTerapia({ 
        limit: 5, 
        searchTerm: terapiaSearch 
      });
      setTiposTerapia(lista);
    } catch (err) {
      setTerapiasError(err.message || 'Erro ao carregar tipos de terapia');
    } finally {
      setTerapiasLoading(false);
    }
  }

  // Handlers de Sucesso dos Modais
  function handlePacienteCreated() {
    carregarPacientes();
  }

  function handleProfissionalCreated() {
    carregarProfissionais();
  }

  function handleTerapiaCreated() {
    carregarTiposTerapia();
  }

  // Exclusões
  async function handleExcluirPaciente(id) {
    if (!id) return;
    const ok = window.confirm('Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.');
    if (!ok) return;
    try {
      await excluirPaciente(id);
      carregarPacientes();
    } catch (err) {
      alert(err.message || 'Erro ao excluir paciente');
    }
  }

  async function handleExcluirProfissional(id) {
    if (!id) return;
    const ok = window.confirm('Tem certeza que deseja excluir este profissional?');
    if (!ok) return;
    try {
      await excluirProfissional(id);
      carregarProfissionais();
    } catch (err) {
      alert(err.message || 'Erro ao excluir profissional');
    }
  }

  async function handleExcluirTerapia(id) {
    if (!id) return;
    const ok = window.confirm('Tem certeza que deseja excluir este tipo de terapia?');
    if (!ok) return;
    try {
      await excluirTipoTerapia(id);
      carregarTiposTerapia();
    } catch (err) {
      alert(err.message || 'Erro ao excluir tipo de terapia');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Cadastro de Recursos</h1>

      {/* Grid de 3 colunas responsivo */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
        marginBottom: 24
      }}>
        {/* Seção Pacientes */}
        <CRUDLightSection
          title="Pacientes"
          items={pacientes}
          loading={pacientesLoading}
          error={pacientesError}
          searchTerm={pacienteSearch}
          onSearchChange={setPacienteSearch}
          onAddClick={() => setModalPaciente(true)}
          renderItem={(paciente) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {paciente.nome_completo}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ID: {paciente.id.substring(0, 8)}...
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditarPaciente(paciente)} style={{ backgroundColor: '#007bff' }}>Editar</button>
                <button onClick={() => handleExcluirPaciente(paciente.id)} style={{ backgroundColor: '#dc3545' }}>Excluir</button>
              </div>
            </div>
          )}
        />

        {/* Seção Profissionais */}
        <CRUDLightSection
          title="Profissionais"
          items={profissionais}
          loading={profissionaisLoading}
          error={profissionaisError}
          searchTerm={profissionalSearch}
          onSearchChange={setProfissionalSearch}
          onAddClick={() => setModalProfissional(true)}
          renderItem={(profissional) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {profissional.nome}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {profissional.tipos_terapia?.nome_terapia || 'Terapia não especificada'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditarProfissional(profissional)} style={{ backgroundColor: '#007bff' }}>Editar</button>
                <button onClick={() => handleExcluirProfissional(profissional.id)} style={{ backgroundColor: '#dc3545' }}>Excluir</button>
              </div>
            </div>
          )}
        />

        {/* Seção Tipos de Terapia */}
        <CRUDLightSection
          title="Tipos de Terapia"
          items={tiposTerapia}
          loading={terapiasLoading}
          error={terapiasError}
          searchTerm={terapiaSearch}
          onSearchChange={setTerapiaSearch}
          onAddClick={() => setModalTerapia(true)}
          renderItem={(terapia) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {terapia.nome_terapia}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Duração: {terapia.tempo_sessao_minutos} minutos
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditarTerapia(terapia)} style={{ backgroundColor: '#007bff' }}>Editar</button>
                <button onClick={() => handleExcluirTerapia(terapia.id)} style={{ backgroundColor: '#dc3545' }}>Excluir</button>
              </div>
            </div>
          )}
        />
      </div>

      {/* Modais */}
      <NovoPacienteModal
        isOpen={modalPaciente}
        onClose={() => setModalPaciente(false)}
        onSuccess={handlePacienteCreated}
      />

      <NovoProfissionalModal
        isOpen={modalProfissional}
        onClose={() => setModalProfissional(false)}
        onSuccess={handleProfissionalCreated}
      />

      <NovoTipoTerapiaModal
        isOpen={modalTerapia}
        onClose={() => setModalTerapia(false)}
        onSuccess={handleTerapiaCreated}
      />

      {/* Modais de Edição */}
      <EditarPacienteModal
        isOpen={!!editarPaciente}
        paciente={editarPaciente}
        onClose={() => setEditarPaciente(null)}
        onSuccess={() => { setEditarPaciente(null); carregarPacientes(); }}
      />

      <EditarProfissionalModal
        isOpen={!!editarProfissional}
        profissional={editarProfissional}
        onClose={() => setEditarProfissional(null)}
        onSuccess={() => { setEditarProfissional(null); carregarProfissionais(); }}
      />

      <EditarTipoTerapiaModal
        isOpen={!!editarTerapia}
        tipoTerapia={editarTerapia}
        onClose={() => setEditarTerapia(null)}
        onSuccess={() => { setEditarTerapia(null); carregarTiposTerapia(); }}
      />
    </div>
  );
}
