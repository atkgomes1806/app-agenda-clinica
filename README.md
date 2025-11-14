# 🏥 Clínica TEA - Sistema de Agenda

Sistema de gerenciamento de agendas para clínicas de terapia usando Clean Architecture.

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Roteamento**: React Router DOM v6
- **Datas**: Luxon
- **Testes**: Jest + Babel

## 📁 Arquitetura

Projeto estruturado em Clean Architecture com 4 camadas:

```
src/
├── domain/              # Interfaces e contratos
│   └── repositories/

# 🏥 Clínica TEA - Sistema de Agenda

Sistema completo para gerenciamento de agendas, planos de sessão, pacientes e relatórios em clínicas de terapia, com foco em usabilidade, segurança e arquitetura escalável.

## ✨ O que o projeto resolve

- Centraliza o agendamento de sessões e ocupação dos profissionais
- Permite cadastro e gestão de pacientes, profissionais e tipos de terapia
- Gera relatórios de ocupação e produtividade
- Garante segurança e controle de acesso via Supabase Auth e RLS
- Facilita o dia a dia da clínica com interface intuitiva e filtros avançados

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, Vite, Luxon, React Router DOM
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions)
- **Testes:** Jest, Babel
- **Arquitetura:** Clean Architecture (Domain, Application, Infrastructure, Presentation)

## 📁 Estrutura de Pastas

```
src/
├── domain/              # Interfaces e contratos
│   └── repositories/
├── application/         # Casos de uso (regras de negócio)
│   └── use-cases/
├── infrastructure/      # Implementações concretas
│   ├── supabase/        # Repositórios Supabase
│   └── config/          # Injetores de dependência
└── presentation/        # Componentes React
    ├── pages/
    ├── components/
    ├── routes/
    └── styles/
```

## 🚀 Funcionalidades Principais

- **Autenticação:** Login seguro, gerenciamento de usuários (CRUD, reset de senha), proteção de rotas
- **Pacientes:** Cadastro, edição, exclusão e validação de dados
- **Planos de Sessão:** Criação recorrente, validação de horários, detecção automática de conflitos de horário para mesmo profissional
- **Agenda:** Visualização por semana/dia, filtro por paciente, impressão otimizada, exibição apenas de dias úteis
- **Relatórios:** Ocupação dos profissionais, total de sessões e horas por período
- **Segurança:** Políticas RLS Supabase para acesso granular, triggers e constraints no banco

## 📝 Instalação e Uso

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o `.env` com suas credenciais Supabase:
   ```bash
   cp .env.example .env
   # Edite VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
   ```
3. Execute os scripts SQL do diretório `sql/` no Supabase SQL Editor.
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse: http://localhost:3000

## 🧪 Testes

- Testes unitários para casos críticos (`criarPlanoSessao`)
- Execute com:
  ```bash
  npm test
  ```

## 📊 Banco de Dados

- Tabelas: `pacientes`, `profissionais`, `tipos_terapia`, `plano_sessao`, `perfis`
- Triggers: preenchimento automático, validação de conflitos, atualização de edição
- RLS: acesso completo para usuários autenticados

## 🐛 Troubleshooting

- Verifique Supabase Auth e perfis
- Execute todos os scripts SQL antes de usar
- IDs e horários devem ser válidos e não conflitar

## 🤝 Contribuição

- Siga Clean Architecture: defina interfaces, implemente casos de uso, desacople dependências, mantenha componentes React focados em UI.

## 👤 Autor

Arthur Gomes Soares  
[LinkedIn](https://www.linkedin.com/in/arthur-gomes-soares-4627a03b/)

---

**Status:** ✅ Pronto para produção (após configuração do Supabase)
- **`pacientes`** - Cadastro de pacientes
