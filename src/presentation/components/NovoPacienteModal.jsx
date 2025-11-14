import { useState } from 'react';
import criarPaciente from '../../application/use-cases/criarPaciente.js';
import Modal from './Modal.jsx';

export default function NovoPacienteModal({ isOpen, onClose, onSuccess }) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const novoPaciente = await criarPaciente({ nome_completo: nomeCompleto });
      setNomeCompleto('');
      onSuccess?.(novoPaciente);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar paciente');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) {
      setNomeCompleto('');
      setError(null);
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} title="Novo Paciente" error={error} onClose={onClose}>
      <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Nome Completo *
            </label>
            <input
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              required
              placeholder="Digite o nome completo"
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
              {submitting ? 'Criando...' : 'Criar Paciente'}
            </button>
          </div>
        </form>
    </Modal>
  );
}
