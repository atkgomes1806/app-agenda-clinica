import { useEffect, useState } from 'react';
import atualizarPaciente from '../../application/use-cases/atualizarPaciente.js';
import Modal from './Modal.jsx';

export default function EditarPacienteModal({ isOpen, paciente, onClose, onSuccess }) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && paciente) {
      setNomeCompleto(paciente.nome_completo || '');
      setError(null);
    }
  }, [isOpen, paciente]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const atualizado = await atualizarPaciente(paciente.id, { nome_completo: nomeCompleto });
      onSuccess?.(atualizado);
      handleClose();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar paciente');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) {
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} title="Editar Paciente" error={error} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Nome Completo *</label>
          <input
            type="text"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            required
            style={{ width: '100%' }}
            disabled={submitting}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={handleClose} disabled={submitting} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}
