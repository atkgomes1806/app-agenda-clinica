import { useEffect, useState } from 'react';
import atualizarProfissional from '../../application/use-cases/atualizarProfissional.js';
import listarTiposTerapia from '../../application/use-cases/listarTiposTerapia.js';
import Modal from './Modal.jsx';

export default function EditarProfissionalModal({ isOpen, profissional, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [tipoTerapiaId, setTipoTerapiaId] = useState('');
  const [tiposTerapia, setTiposTerapia] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      carregarTipos();
      if (profissional) {
        setNome(profissional.nome || '');
        setTipoTerapiaId(profissional.tipo_terapia_id || profissional.tipos_terapia?.id || '');
        setError(null);
      }
    }
  }, [isOpen, profissional]);

  async function carregarTipos() {
    setLoadingTipos(true);
    try {
      const lista = await listarTiposTerapia();
      setTiposTerapia(lista);
    } catch (err) {
      console.error('Erro ao carregar tipos de terapia:', err);
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
      const atualizado = await atualizarProfissional(profissional.id, { nome, tipo_terapia_id: tipoTerapiaId });
      onSuccess?.(atualizado);
      handleClose();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar profissional');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) onClose();
  }

  return (
    <Modal isOpen={isOpen} title="Editar Profissional" error={error} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Nome *</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ width: '100%' }} disabled={submitting} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tipo de Terapia *</label>
          {loadingTipos ? (
            <div>Carregando tipos...</div>
          ) : (
            <select value={tipoTerapiaId} onChange={(e) => setTipoTerapiaId(e.target.value)} required style={{ width: '100%' }} disabled={submitting}>
              <option value="">-- Selecione --</option>
              {tiposTerapia.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.nome_terapia} ({tipo.tempo_sessao_minutos}min)</option>
              ))}
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={handleClose} disabled={submitting} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
          <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  );
}
