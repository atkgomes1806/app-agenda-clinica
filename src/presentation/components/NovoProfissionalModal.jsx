import { useState, useEffect } from 'react';
import criarProfissional from '../../application/use-cases/criarProfissional.js';
import listarTiposTerapia from '../../application/use-cases/listarTiposTerapia.js';
import Modal from './Modal.jsx';

export default function NovoProfissionalModal({ isOpen, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [tipoTerapiaId, setTipoTerapiaId] = useState('');
  const [tiposTerapia, setTiposTerapia] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadingTipos, setLoadingTipos] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarTipos();
    }
  }, [isOpen]);

  async function carregarTipos() {
    setLoadingTipos(true);
    try {
      const tipos = await listarTiposTerapia();
      setTiposTerapia(tipos);
    } catch (err) {
      console.error('Erro ao carregar tipos:', err);
    } finally {
      setLoadingTipos(false);
    }
  }

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const novoProfissional = await criarProfissional({ 
        nome, 
        tipo_terapia_id: tipoTerapiaId 
      });
      setNome('');
      setTipoTerapiaId('');
      onSuccess?.(novoProfissional);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar profissional');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) {
      setNome('');
      setTipoTerapiaId('');
      setError(null);
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} title="Novo Profissional" error={error} onClose={onClose}>
      <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Nome *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Digite o nome"
              style={{ width: '100%' }}
              disabled={submitting}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Tipo de Terapia *
            </label>
            {loadingTipos ? (
              <div>Carregando tipos...</div>
            ) : (
              <select
                value={tipoTerapiaId}
                onChange={(e) => setTipoTerapiaId(e.target.value)}
                required
                style={{ width: '100%' }}
                disabled={submitting}
              >
                <option value="">-- Selecione --</option>
                {tiposTerapia.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome_terapia} ({tipo.tempo_sessao_minutos}min)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button 
              type="button"
              onClick={handleClose}
              disabled={submitting}
              style={{ backgroundColor: '#6c757d' }}
            >
              Cancelar
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar Profissional'}
            </button>
          </div>
        </form>
    </Modal>
  );
}
