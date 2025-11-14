import { useEffect, useState } from 'react';
import listarPacientes from '../../application/use-cases/listarPacientes.js';
import listarTiposTerapia from '../../application/use-cases/listarTiposTerapia.js';
import listarProfissionais from '../../application/use-cases/listarProfissionais.js';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      try {
        const [p, t, pr] = await Promise.all([
          listarPacientes(),
          listarTiposTerapia(),
          listarProfissionais(),
        ]);

        if (!mounted) return;
        setPacientes(p || []);
        setTipos(t || []);
        setProfissionais(pr || []);
      } catch (err) {
        console.error('PacientesPage load error:', err);
        if (mounted) setError(err.message || 'Erro ao carregar dados');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Carregando pacientes...</div>;
  if (error) return <div style={{ color: 'red' }}>Erro: {error}</div>;

  const columns = pacientes.length > 0 ? Object.keys(pacientes[0]) : [];

  return (
    <div style={{ padding: 16 }}>
      <h1>Pacientes</h1>

      <section style={{ marginBottom: 16 }}>
        <label>
          Tipos de Terapia:
          <select>
            <option value="">— todos —</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome || t.descricao || t.id}
              </option>
            ))}
          </select>
        </label>

        <label style={{ marginLeft: 16 }}>
          Profissionais:
          <select>
            <option value="">— todos —</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_completo || p.nome || p.id}
              </option>
            ))}
          </select>
        </label>
      </section>

      <table border="1" cellPadding="6" cellSpacing="0">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pacientes.map((row) => (
            <tr key={row.id || JSON.stringify(row)}>
              {columns.map((col) => (
                <td key={col}>{String(row[col] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
