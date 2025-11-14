import { useEffect, useState } from 'react';
import gerarAgenda from '../../application/use-cases/gerarAgenda.js';
import SemesterStatusBanner from '../components/SemesterStatusBanner.jsx';

// Gera cor consistente baseada em string (hash simples)
function stringToColor(str) {
  if (!str) return '#4caf50';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 55%)`;
}

// Formatador de data para input type="date" (YYYY-MM-DD)
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse date from input (YYYY-MM-DD)
function parseDateFromInput(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function AgendaPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('week'); // 'week' ou 'day'
  const [selectedDate, setSelectedDate] = useState(new Date()); // Data selecionada pelo date picker
  const [filteredPatient, setFilteredPatient] = useState(null); // Paciente filtrado (null = mostrar todos)

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // Carrega 4 semanas à frente
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(start);
        end.setDate(start.getDate() + 28); // 4 semanas

        const ev = await gerarAgenda(start, end);

        if (mounted) setEvents(ev);
      } catch (err) {
        console.error('AgendaPage error', err);
        if (mounted) setError(err.message || 'Erro ao gerar agenda');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Carregando agenda...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>Erro: {error}</div>;

  // Função para obter a data da segunda-feira da semana que contém a data selecionada
  function getWeekStart(date) {
    const selectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayOfWeek = selectedDay.getDay(); // 0 = domingo
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // ajusta para segunda-feira
    const monday = new Date(selectedDay);
    monday.setDate(selectedDay.getDate() + diff);
    return monday;
  }

  // Gera array de 5 dias da semana (seg-sex) a partir da data
  function getWeekDays(date) {
    const monday = getWeekStart(date);
    return Array.from({ length: 5 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  }

  // Função de navegação
  function navigatePrevious() {
    if (viewMode === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 7);
      setSelectedDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() - 1);
      setSelectedDate(newDate);
    }
  }

  function navigateNext() {
    if (viewMode === 'week') {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 7);
      setSelectedDate(newDate);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + 1);
      setSelectedDate(newDate);
    }
  }

  function handleDateChange(e) {
    const newDate = parseDateFromInput(e.target.value);
    setSelectedDate(newDate);
  }

  // Função para imprimir a agenda
  function handlePrint() {
    window.print();
  }

  // Função para alternar filtro de paciente
  function togglePatientFilter(patientName) {
    if (filteredPatient === patientName) {
      setFilteredPatient(null); // Remove filtro se clicar no mesmo paciente
    } else {
      setFilteredPatient(patientName); // Aplica filtro
    }
  }

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Renderização por Semana
  if (viewMode === 'week') {
    const weekDays = getWeekDays(selectedDate);
    const weekStart = weekDays[0];
    const weekEnd = new Date(weekDays[4]); // Sexta-feira (índice 4)
    weekEnd.setHours(23, 59, 59, 999);

    let weekEvents = events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });

    // Aplica filtro de paciente se houver
    if (filteredPatient) {
      weekEvents = weekEvents.filter(e => e.paciente === filteredPatient);
    }

    // Organiza eventos por dia e horário
    const eventsByDay = {};
    const allTimeSlots = new Set();
    const pacienteColors = {}; // Mapa de cores por paciente

    weekEvents.forEach(event => {
      const eventDate = new Date(event.start);
      const dayKey = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      // Usa UTC para extrair a hora correta
      const timeKey = eventDate.toISOString().substring(11, 16); // HH:MM em UTC
      
      // Usa dados do evento diretamente
      const pacienteNome = event.paciente || 'Paciente';
      const terapia = event.terapia || 'Terapia';
      const profissional = event.profissional || 'Profissional';
      
      // Gera cor única para o paciente
      if (!pacienteColors[pacienteNome]) {
        pacienteColors[pacienteNome] = stringToColor(pacienteNome);
      }
      
      allTimeSlots.add(timeKey);

      if (!eventsByDay[dayKey]) {
        eventsByDay[dayKey] = {};
      }
      if (!eventsByDay[dayKey][timeKey]) {
        eventsByDay[dayKey][timeKey] = [];
      }
      
      eventsByDay[dayKey][timeKey].push({ ...event, pacienteNome, terapia, profissional });
    });

    const sortedTimeSlots = Array.from(allTimeSlots).sort();

    return (
      <div style={{ padding: 24 }}>
        <SemesterStatusBanner />
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }} className="no-print">
          <h1 style={{ margin: 0 }}>Agenda</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4, backgroundColor: '#f0f0f0', padding: 4, borderRadius: 4 }}>
              <button
                onClick={() => setViewMode('week')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: viewMode === 'week' ? '#007bff' : 'transparent',
                  color: viewMode === 'week' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('day')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: viewMode === 'day' ? '#007bff' : 'transparent',
                  color: viewMode === 'day' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Dia
              </button>
            </div>
            <input
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '14px'
              }}
            />
            <button
              onClick={navigatePrevious}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              ← Anterior
            </button>
            <span style={{ padding: '0 16px', fontWeight: 500 }}>
              {weekDays[0].toLocaleDateString('pt-BR')} - {weekDays[4].toLocaleDateString('pt-BR')}
            </span>
            <button
              onClick={navigateNext}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              Próxima →
            </button>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>

        {weekEvents.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 48, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 8 
          }}>
            Nenhum evento agendado para esta semana
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr>
                  <th style={{ 
                    border: '1px solid #ddd', 
                    padding: 12, 
                    backgroundColor: '#f8f9fa',
                    position: 'sticky',
                    left: 0,
                    zIndex: 10
                  }}>
                    Horário
                  </th>
                  {weekDays.map((day, idx) => (
                    <th key={idx} style={{ 
                      border: '1px solid #ddd', 
                      padding: 12,
                      backgroundColor: '#f8f9fa',
                      minWidth: 180
                    }}>
                      <div>{diasSemana[day.getDay()]}</div>
                      <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>
                        {day.toLocaleDateString('pt-BR')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTimeSlots.map(timeSlot => (
                  <tr key={timeSlot}>
                    <td style={{ 
                      border: '1px solid #ddd', 
                      padding: 12,
                      fontWeight: 500,
                      backgroundColor: '#f8f9fa',
                      position: 'sticky',
                      left: 0,
                      zIndex: 5
                    }}>
                      {timeSlot}
                    </td>
                    {weekDays.map((day, idx) => {
                      const dayKey = day.toISOString().split('T')[0];
                      const dayEventsAtTime = eventsByDay[dayKey]?.[timeSlot] || [];
                      const hasEvents = dayEventsAtTime.length > 0;

                      return (
                        <td key={idx} style={{ 
                          border: '1px solid #ddd', 
                          padding: 8,
                          backgroundColor: 'white',
                          verticalAlign: 'top'
                        }}>
                          {hasEvents ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {dayEventsAtTime.map((evt, i) => (
                                <div key={i} style={{
                                  padding: 8,
                                  backgroundColor: pacienteColors[evt.pacienteNome],
                                  color: 'white',
                                  borderRadius: 4,
                                  fontSize: '13px'
                                }}>
                                  <div style={{ fontWeight: 600 }}>{evt.pacienteNome}</div>
                                  <div style={{ fontSize: '11px', opacity: 0.95, marginTop: 2 }}>
                                    {evt.terapia}
                                  </div>
                                  <div style={{ fontSize: '10px', opacity: 0.85, marginTop: 1 }}>
                                    {evt.profissional}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: '#ccc', fontSize: '12px', textAlign: 'center' }}>-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Título para impressão */}
        <div style={{ display: 'none' }} className="print-only">
          <h1 style={{ marginBottom: 16 }}>
            Agenda - Semana de {weekDays[0].toLocaleDateString('pt-BR')} a {weekDays[4].toLocaleDateString('pt-BR')}
          </h1>
        </div>

        {/* Legenda de pacientes (clicável para filtrar) */}
        {Object.keys(pacienteColors).length > 0 && (
          <div className="legenda-pacientes no-print" style={{ marginTop: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              Pacientes {filteredPatient && <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>(clique novamente para remover filtro)</span>}
            </h3>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 12 }}>
              {filteredPatient ? `Exibindo apenas: ${filteredPatient}` : 'Clique em um paciente para filtrar'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(pacienteColors).map(([nome, cor]) => (
                <button
                  key={nome}
                  onClick={() => togglePatientFilter(nome)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: cor,
                    color: 'white',
                    borderRadius: 4,
                    fontSize: '13px',
                    fontWeight: 500,
                    border: filteredPatient === nome ? '3px solid #333' : 'none',
                    cursor: 'pointer',
                    opacity: filteredPatient && filteredPatient !== nome ? 0.4 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {nome}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renderização por Dia
  const selectedDayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const dayStart = new Date(selectedDayDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDayDate);
  dayEnd.setHours(23, 59, 59, 999);

  let dayEvents = events.filter(e => {
    const eventDate = new Date(e.start);
    return eventDate >= dayStart && eventDate <= dayEnd;
  });

  // Aplica filtro de paciente se houver
  if (filteredPatient) {
    dayEvents = dayEvents.filter(e => e.paciente === filteredPatient);
  }

  // Organiza eventos por horário e terapia
  const eventsByTime = {};
  const allTerapias = new Set();
  const terapiaProfissionalMap = {}; // Mapeia terapia -> profissional
  const allTimeSlots = new Set();
  const pacienteColors = {};

  dayEvents.forEach(event => {
    const eventDate = new Date(event.start);
    // Usa UTC para extrair a hora correta
    const timeKey = eventDate.toISOString().substring(11, 16); // HH:MM em UTC
    
    const pacienteNome = event.paciente || 'Paciente';
    const terapia = event.terapia || 'Terapia';
    const profissional = event.profissional || 'Profissional';
    
    if (!pacienteColors[pacienteNome]) {
      pacienteColors[pacienteNome] = stringToColor(pacienteNome);
    }
    
    allTimeSlots.add(timeKey);
    allTerapias.add(terapia);
    
    // Armazena o profissional para cada terapia
    if (!terapiaProfissionalMap[terapia]) {
      terapiaProfissionalMap[terapia] = profissional;
    }

    if (!eventsByTime[timeKey]) {
      eventsByTime[timeKey] = {};
    }
    if (!eventsByTime[timeKey][terapia]) {
      eventsByTime[timeKey][terapia] = [];
    }
    
    eventsByTime[timeKey][terapia].push({ ...event, pacienteNome, terapia, profissional });
  });

  const sortedTimeSlots = Array.from(allTimeSlots).sort();
  const sortedTerapias = Array.from(allTerapias).sort();

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }} className="no-print">
        <h1 style={{ margin: 0 }}>Agenda</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, backgroundColor: '#f0f0f0', padding: 4, borderRadius: 4 }}>
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'week' ? '#007bff' : 'transparent',
                color: viewMode === 'week' ? 'white' : '#333',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'day' ? '#007bff' : 'transparent',
                color: viewMode === 'day' ? 'white' : '#333',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Dia
            </button>
          </div>
          <input
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '14px'
            }}
          />
          <button
            onClick={navigatePrevious}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            ← Anterior
          </button>
          <span style={{ padding: '0 16px', fontWeight: 500 }}>
            {diasSemana[selectedDayDate.getDay()]} - {selectedDayDate.toLocaleDateString('pt-BR')}
          </span>
          <button
            onClick={navigateNext}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Próximo →
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {dayEvents.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 48, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 8 
        }}>
          Nenhum evento agendado para este dia
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr>
                <th style={{ 
                  border: '1px solid #ddd', 
                  padding: 12, 
                  backgroundColor: '#f8f9fa',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10
                }}>
                  Horário
                </th>
                {sortedTerapias.map((terapia, idx) => (
                  <th key={idx} style={{ 
                    border: '1px solid #ddd', 
                    padding: 12,
                    backgroundColor: '#f8f9fa',
                    minWidth: 200
                  }}>
                    <div style={{ fontWeight: 600 }}>{terapia}</div>
                    <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#666', marginTop: 4 }}>
                      {terapiaProfissionalMap[terapia]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTimeSlots.map(timeSlot => (
                <tr key={timeSlot}>
                  <td style={{ 
                    border: '1px solid #ddd', 
                    padding: 12,
                    fontWeight: 500,
                    backgroundColor: '#f8f9fa',
                    position: 'sticky',
                    left: 0,
                    zIndex: 5
                  }}>
                    {timeSlot}
                  </td>
                  {sortedTerapias.map((terapia, idx) => {
                    const eventsAtTimeForTerapia = eventsByTime[timeSlot]?.[terapia] || [];
                    const hasEvents = eventsAtTimeForTerapia.length > 0;

                    return (
                      <td key={idx} style={{ 
                        border: '1px solid #ddd', 
                        padding: 8,
                        backgroundColor: 'white',
                        verticalAlign: 'top'
                      }}>
                        {hasEvents ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {eventsAtTimeForTerapia.map((evt, i) => (
                              <div key={i} style={{
                                padding: 10,
                                backgroundColor: pacienteColors[evt.pacienteNome],
                                color: 'white',
                                borderRadius: 4,
                                fontSize: '14px'
                              }}>
                                <div style={{ fontWeight: 600 }}>{evt.pacienteNome}</div>
                                <div style={{ fontSize: '12px', opacity: 0.95, marginTop: 4 }}>
                                  {new Date(evt.start).toISOString().substring(11, 16)} - {new Date(evt.end).toISOString().substring(11, 16)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: '#ccc', fontSize: '12px', textAlign: 'center' }}>-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Título para impressão */}
      <div style={{ display: 'none' }} className="print-only">
        <h1 style={{ marginBottom: 16 }}>
          Agenda - {diasSemana[selectedDayDate.getDay()]} {selectedDayDate.toLocaleDateString('pt-BR')}
        </h1>
      </div>

      {/* Legenda de pacientes (clicável para filtrar) */}
      {Object.keys(pacienteColors).length > 0 && (
        <div className="legenda-pacientes no-print" style={{ marginTop: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
            Pacientes {filteredPatient && <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>(clique novamente para remover filtro)</span>}
          </h3>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 12 }}>
            {filteredPatient ? `Exibindo apenas: ${filteredPatient}` : 'Clique em um paciente para filtrar'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(pacienteColors).map(([nome, cor]) => (
              <button
                key={nome}
                onClick={() => togglePatientFilter(nome)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: cor,
                  color: 'white',
                  borderRadius: 4,
                  fontSize: '13px',
                  fontWeight: 500,
                  border: filteredPatient === nome ? '3px solid #333' : 'none',
                  cursor: 'pointer',
                  opacity: filteredPatient && filteredPatient !== nome ? 0.4 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
