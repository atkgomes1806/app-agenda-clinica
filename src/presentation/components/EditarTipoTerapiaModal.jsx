import { useEffect, useState } from 'react';
import atualizarTipoTerapia from '../../application/use-cases/atualizarTipoTerapia.js';
import Modal from './Modal.jsx';

export default function EditarTipoTerapiaModal({ isOpen, tipoTerapia, onClose, onSuccess }) {
  const [nomeTerapia, setNomeTerapia] = useState('');
  const [tempoSessao, setTempoSessao] = useState(40);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && tipoTerapia) {
      setNomeTerapia(tipoTerapia.nome_terapia || '');
      setTempoSessao(tipoTerapia.tempo_sessao_minutos || 40);
      setError(null);
    }
  }, [isOpen, tipoTerapia]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const atualizado = await atualizarTipoTerapia(tipoTerapia.id, { nome_terapia: nomeTerapia, tempo_sessao_minutos: Number(tempoSessao) });
      onSuccess?.(atualizado);
      handleClose();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar tipo de terapia');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) onClose();
  }

  return (
    <Modal isOpen={isOpen} title="Editar Tipo de Terapia" error={error} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Nome da Terapia *</label>
          <input type="text" value={nomeTerapia} onChange={(e) => setNomeTerapia(e.target.value)} required style={{ width: '100%' }} disabled={submitting} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tempo de Sessão (minutos) *</label>
          <input type="number" value={tempoSessao} onChange={(e) => setTempoSessao(e.target.value)} required min={1} step={1} style={{ width: '100%' }} disabled={submitting} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={handleClose} disabled={submitting} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}
