import { useEffect, useState } from 'react';
import gerarRelatorioOcupacao from '../../application/use-cases/gerarRelatorioOcupacao.js';

export default function RelatorioOcupacaoPage() {
  const [relatorio, setRelatorio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await gerarRelatorioOcupacao();
        if (mounted) setRelatorio(data || []);
      } catch (err) {
        console.error('Erro ao gerar relatório de ocupação', err);
        if (mounted) setError(err.message || 'Erro ao carregar relatório');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <div>Carregando relatório...</div>;
  if (error) return <div style={{ color: 'red' }}>Erro: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Relatório de Atendimentos</h1>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Profissional</th>
            <th>Terapia</th>
            <th>Total Sessão (min)</th>
            <th>Contagem Sessões</th>
            <th>Pacientes Distintos</th>
            <th>Ocupação (horas)</th>
          </tr>
        </thead>
        <tbody>
          {relatorio.map((r) => (
            <tr key={r.profissional_id}>
              <td>{r.nome_completo || '-'}</td>
              <td>{r.terapia || '-'}</td>
              <td style={{ textAlign: 'right' }}>{r.total_sessao_minutos ?? 0}</td>
              <td style={{ textAlign: 'right' }}>{r.contagem_sessao ?? 0}</td>
              <td style={{ textAlign: 'right' }}>{r.pacientes_distintos ?? 0}</td>
              <td style={{ textAlign: 'right' }}>{(Number(r.ocupacao_em_horas) || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
