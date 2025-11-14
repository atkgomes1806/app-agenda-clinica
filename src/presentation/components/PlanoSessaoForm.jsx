import { useState, useEffect } from 'react';

export default function PlanoSessaoForm({ pacientesList = [], profissionaisList = [], tiposTerapiaList = [], handleCreate }) {
  const [pacienteId, setPacienteId] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [tipoTerapiaId, setTipoTerapiaId] = useState('');
  const [diaSemana, setDiaSemana] = useState('1'); // Segunda-feira por padrão
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('09:00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const dias = [
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
  ];

  useEffect(() => {
    if (!horaInicio || !tipoTerapiaId) return;
    const tipoSelecionado = tiposTerapiaList.find(t => t.id === tipoTerapiaId);
    if (!tipoSelecionado || !tipoSelecionado.tempo_sessao_minutos) return;
    const [hours, minutes] = horaInicio.split(':').map(Number);
    const inicioDate = new Date();
    inicioDate.setHours(hours, minutes, 0, 0);
    const fimDate = new Date(inicioDate.getTime() + tipoSelecionado.tempo_sessao_minutos * 60000);
    const horaFimCalculada = `${String(fimDate.getHours()).padStart(2, '0')}:${String(fimDate.getMinutes()).padStart(2, '0')}`;
    setHoraFim(horaFimCalculada);
  }, [horaInicio, tipoTerapiaId, tiposTerapiaList]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!pacienteId || !profissionalId || !tipoTerapiaId || horaInicio == null) {
      setError('Preencha paciente, profissional, tipo de terapia e hora de início.');
      return;
    }
    const payload = {
      paciente_id: pacienteId,
      profissional_id: profissionalId,
      tipo_terapia_id: tipoTerapiaId,
      dia_semana: Number(diaSemana),
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      ativo: true,
    };
    try {
      setSubmitting(true);
      await handleCreate(payload);
      setPacienteId('');
      setProfissionalId('');
      setTipoTerapiaId('');
      setDiaSemana('1');
      setHoraInicio('08:00');
    } catch (err) {
      setError(err.message || 'Erro ao criar plano de sessão');
    } finally {
      setSubmitting(false);
    }
  }

  // Vincula terapia automaticamente ao selecionar um profissional (assumindo 1 terapia por profissional)
  useEffect(() => {
    if (!profissionalId) return;
    // encontra profissional na lista
    const prof = profissionaisList.find(p => p.id === profissionalId);
    // alguns repositórios já retornam join com tipos_terapia
    const terapiaIdVinculada = prof?.tipo_terapia_id || prof?.tipos_terapia?.id;
    if (terapiaIdVinculada) {
      setTipoTerapiaId(terapiaIdVinculada);
    }
  }, [profissionalId, profissionaisList]);

  const tipoSelecionado = tiposTerapiaList.find(t => t.id === tipoTerapiaId);

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 960 }}>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          alignItems: 'end',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Paciente</label>
          <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} style={{ width: '100%' }}>
            <option value="">-- selecione paciente --</option>
            {pacientesList.map((p) => (
              <option key={p.id} value={p.id}>{p.nome_completo || p.nome || p.id}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Profissional</label>
          <select value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)} style={{ width: '100%' }}>
            <option value="">-- selecione profissional --</option>
            {profissionaisList.map((p) => (
              <option key={p.id} value={p.id}>{p.nome || p.id}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Tipo de Terapia</label>
          <select value={tipoTerapiaId} onChange={(e) => setTipoTerapiaId(e.target.value)} style={{ width: '100%' }} disabled>
            <option value="">-- selecione um profissional --</option>
            {tiposTerapiaList
              .filter(t => !profissionalId || t.id === tipoTerapiaId)
              .map((t) => (
                <option key={t.id} value={t.id}>{t.nome_terapia || t.nome || t.id} ({t.tempo_sessao_minutos || 40} min)</option>
              ))}
          </select>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {profissionalId ? 'Terapia vinculada ao profissional selecionado.' : 'Selecione um profissional para definir a terapia.'}
          </div>
          {tipoSelecionado && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Duração da sessão: {tipoSelecionado.tempo_sessao_minutos} minutos</div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Dia da Semana</label>
          <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} style={{ width: '100%' }}>
            {dias.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Hora Início</label>
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Hora Fim (calculada automaticamente)</label>
          <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} style={{ width: '100%', backgroundColor: '#f7f7f7' }} />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>A hora fim é calculada automaticamente com base no tempo da sessão</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="submit" disabled={submitting}>{submitting ? 'Criando...' : 'Criar Plano de Sessão'}</button>
      </div>
    </form>
  );
}
