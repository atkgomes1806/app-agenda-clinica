import { DateTime } from 'luxon';
import { planoSessaoRepository } from '../../infrastructure/config/planoSessaoInjector.js';

/**
 * Converte uma string de hora 'HH:MM' ou 'HH:MM:SS' para o horário combinado com a data fornecida (usando Luxon)
 * @param {DateTime} dateTime - Objeto DateTime do Luxon
 * @param {string} timeStr - String no formato 'HH:MM' ou 'HH:MM:SS'
 * @returns {DateTime} DateTime com a hora especificada
 */
function combineDateAndTime(dateTime, timeStr) {
  const parts = String(timeStr).split(':').map((p) => parseInt(p, 10));
  return dateTime.set({
    hour: parts[0] || 0,
    minute: parts[1] || 0,
    second: parts[2] || 0,
    millisecond: 0,
  });
}

/**
 * Gera eventos de agenda a partir de planos recorrentes no intervalo [dataInicio, dataFim]
 * @param {string|Date} dataInicio - ISO string ou Date object
 * @param {string|Date} dataFim - ISO string ou Date object
 * @returns {Promise<Array>} lista de eventos com propriedades start/end como Date objects
 */
export async function gerarAgenda(dataInicio, dataFim) {
  // Converte para DateTime do Luxon (UTC)
  let dtInicio = dataInicio instanceof Date 
    ? DateTime.fromJSDate(dataInicio, { zone: 'utc' })
    : DateTime.fromISO(dataInicio, { zone: 'utc' });
  
  let dtFim = dataFim instanceof Date 
    ? DateTime.fromJSDate(dataFim, { zone: 'utc' })
    : DateTime.fromISO(dataFim, { zone: 'utc' });

  // Valida DateTime
  if (!dtInicio.isValid || !dtFim.isValid) {
    throw new Error('dataInicio e dataFim devem ser datas válidas (ISO string ou Date object).');
  }
  if (dtInicio > dtFim) {
    throw new Error('dataInicio deve ser anterior ou igual a dataFim.');
  }

  // Normaliza para início do dia (UTC)
  dtInicio = dtInicio.startOf('day');
  dtFim = dtFim.startOf('day');

  // Busca planos ativos via repositório (injeção) com tratamento de erro
  let planos;
  try {
    planos = await planoSessaoRepository.fetchPlanosAtivos();
  } catch (error) {
    console.error('[gerarAgenda] Erro ao buscar planos ativos:', error);
    throw new Error('Não foi possível carregar os planos de sessão para gerar a agenda. Tente novamente.');
  }

  const events = [];

  // Itera sobre cada plano e cria eventos dentro do período
  for (const plano of planos) {
    // garante que dia_semana é número (0-6, compatível com getUTCDay e Luxon weekday-1)
    const diaSemanaPlano = Number(plano.dia_semana);
    if (!Number.isInteger(diaSemanaPlano) || diaSemanaPlano < 0 || diaSemanaPlano > 6) continue;

    // Prepara nome para o título
    const nomePaciente = plano.paciente_nome_completo || (plano.pacientes && plano.pacientes.nome_completo) || 'Paciente';
    const nomeProfissional = plano.profissional_nome || (plano.profissionais && (plano.profissionais.nome_completo || plano.profissionais.nome)) || 'Profissional';
    const nomeTerapia = plano.tipo_terapia_nome || (plano.tipos_terapia && plano.tipos_terapia.nome_terapia) || 'Terapia';

    // percorre dias no intervalo usando Luxon
    for (let dt = dtInicio; dt <= dtFim; dt = dt.plus({ days: 1 })) {
      // Luxon weekday: 1=Monday, 7=Sunday; BD usa 0=Sunday, 6=Saturday
      // Converte Luxon weekday para formato 0-6: (weekday % 7)
      const dowLuxon = dt.weekday % 7; // 0=Sunday, 1=Monday, ..., 6=Saturday
      if (dowLuxon !== diaSemanaPlano) continue;

      // combina data com hora_inicio/hora_fim do plano
      try {
        const start = combineDateAndTime(dt, plano.hora_inicio);
        const end = combineDateAndTime(dt, plano.hora_fim || plano.hora_inicio);

        const event = {
          title: `Plano: ${nomePaciente} - ${nomeProfissional}`,
          start: start.toJSDate(), // converte para Date object para compatibilidade
          end: end.toJSDate(),
          originalPlanoId: plano.id,
          terapia: nomeTerapia,
          profissional: nomeProfissional,
          paciente: nomePaciente,
        };

        events.push(event);
      } catch (err) {
        // ignora planos com dados de tempo inválidos
        console.error('[gerarAgenda] Erro ao combinar data/hora para plano', plano.id, err.message || err);
        continue;
      }
    }
  }

  // Retorna lista de eventos (Date objects em UTC)
  return events;
}


export default gerarAgenda;
