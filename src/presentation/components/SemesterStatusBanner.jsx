import { useEffect, useState } from "react";
import { supabase } from "../../infrastructure/supabase/client.js";

export default function SemesterStatusBanner() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    fetchSemesterStatus();
  }, []);

  async function fetchSemesterStatus() {
    try {
      const { data, error } = await supabase.rpc('get_semester_status');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStatus(data[0]);
      }
    } catch (err) {
      console.error('Erro ao buscar status do semestre:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadBackup() {
    try {
      // Implementar download do backup do semestre anterior
      const { data, error } = await supabase.storage
        .from('backups')
        .download(`${status.previous_semester}/backup-${status.previous_semester}.zip`);
      
      if (error) throw error;
      
      // Criar link de download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${status.previous_semester}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar backup:', err);
      alert('Erro ao baixar backup: ' + err.message);
    }
  }

  // Exibir toast de sucesso por 5s: apenas no primeiro login do dia, por até 3 dias após o primeiro aparecimento
  useEffect(() => {
    if (!status || !status.backup_exists || !status.previous_semester) return;

    try {
      const tzNow = new Date();
      const today = new Date(tzNow.getFullYear(), tzNow.getMonth(), tzNow.getDate());
      const todayKey = today.toISOString().slice(0, 10); // YYYY-MM-DD

      const keyPrefix = `backupToast:${status.previous_semester}`;
      const firstSeenKey = `${keyPrefix}:firstSeenAt`;
      const lastShownKey = `${keyPrefix}:lastShownDate`;

      let firstSeenAtStr = localStorage.getItem(firstSeenKey);
      if (!firstSeenAtStr) {
        // Primeira vez que detectamos backup para este semestre
        localStorage.setItem(firstSeenKey, today.toISOString());
        firstSeenAtStr = today.toISOString();
      }

      const firstSeenDate = new Date(firstSeenAtStr);
      const dayMs = 24 * 60 * 60 * 1000;
      const daysElapsed = Math.floor((today.getTime() - new Date(firstSeenDate.getFullYear(), firstSeenDate.getMonth(), firstSeenDate.getDate()).getTime()) / dayMs);

      // Exibir no máximo nos 3 primeiros dias (0,1,2) e apenas uma vez por dia
      const lastShownDate = localStorage.getItem(lastShownKey);
      const shouldShowToday = daysElapsed <= 2 && lastShownDate !== todayKey;

      if (shouldShowToday) {
        setShowSuccessToast(true);
        localStorage.setItem(lastShownKey, todayKey);
        const timer = setTimeout(() => setShowSuccessToast(false), 5000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Em caso de erro com localStorage, não bloquear a UI
      console.warn('Toast backup: storage unavailable', e);
    }
  }, [status]);

  if (loading) return null;
  if (error) return null;
  if (!status) return null;

  // Toast de sucesso no canto superior direito (aparece por 5s se aplicável)
  const Toast = () => (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      backgroundColor: '#d4edda',
      border: '1px solid #28a745',
      color: '#155724',
      borderRadius: 8,
      padding: '12px 14px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      maxWidth: 360
    }}>
      <div style={{ fontWeight: 600 }}>✅ Backup concluído</div>
      <div style={{ fontSize: 13, lineHeight: 1.2 }}>
        Semestre {status?.previous_semester} pronto para download.
      </div>
      <button
        onClick={handleDownloadBackup}
        style={{
          padding: '6px 10px',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          whiteSpace: 'nowrap'
        }}
      >
        Baixar
      </button>
    </div>
  );

  // Mostrar banner apenas se:
  // 1. Estamos na janela de alerta (dias 1-10 do semestre)
  // 2. E não existe backup do semestre anterior
  if (status.in_warning_window && !status.backup_exists) {
    return (
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: 4,
        padding: 16,
        margin: '16px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {showSuccessToast && <Toast />}
        <div>
          <div style={{ fontWeight: 600, color: '#856404', marginBottom: 4 }}>
            ⚠️ Backup Semestral Pendente
          </div>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            Faltam <span style={{ fontWeight: 700 }}>{status.days_left}</span> dia(s) para o prazo de backup do semestre <span style={{ fontWeight: 700 }}>{status.previous_semester}</span>.
            É necessário realizar o backup antes da purga automática.
          </div>
        </div>
        <button
          onClick={handleDownloadBackup}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffc107',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 500,
            whiteSpace: 'nowrap'
          }}
        >
          Gerar Backup Agora
        </button>
      </div>
    );
  }

  // Quando há backup, não mostramos mais o banner verde persistente.
  // Em vez disso, mostramos um pequeno toast por 5s, por até 3 dias, no primeiro login do dia.
  if (status.backup_exists) {
    return <>{showSuccessToast && <Toast />}</>;
  }

  return null;
}
