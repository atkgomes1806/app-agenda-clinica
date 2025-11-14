import { useState } from 'react';
import criarTipoTerapia from '../../application/use-cases/criarTipoTerapia.js';
import Modal from './Modal.jsx';

export default function NovoTipoTerapiaModal({ isOpen, onClose, onSuccess }) {
  const [nomeTerapia, setNomeTerapia] = useState('');
  const [tempoSessao, setTempoSessao] = useState(40);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const novoTipo = await criarTipoTerapia({ 
        nome_terapia: nomeTerapia,
        tempo_sessao_minutos: Number(tempoSessao)
      });
      setNomeTerapia('');
      setTempoSessao(40);
      onSuccess?.(novoTipo);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar tipo de terapia');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) {
      setNomeTerapia('');
      setTempoSessao(40);
      setError(null);
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} title="Novo Tipo de Terapia" error={error} onClose={onClose}>
      <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Nome da Terapia *
            </label>
            <input
              type="text"
              value={nomeTerapia}
              onChange={(e) => setNomeTerapia(e.target.value)}
              required
              placeholder="Ex: Fonoaudiologia, Psicologia, etc."
              style={{ width: '100%' }}
              disabled={submitting}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Tempo de Sessão (minutos) *
            </label>
            <input
              type="number"
              value={tempoSessao}
              onChange={(e) => setTempoSessao(e.target.value)}
              required
              min="1"
              step="1"
              style={{ width: '100%' }}
              disabled={submitting}
            />
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
              {submitting ? 'Criando...' : 'Criar Tipo de Terapia'}
            </button>
          </div>
        </form>
    </Modal>
  );
}
