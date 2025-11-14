import PacienteRepositorySupabase from '../supabase/PacienteRepositorySupabase.js';

// Exporta uma instância pronta do repositório (injeção simples)
export const pacienteRepository = new PacienteRepositorySupabase();

export default pacienteRepository;
