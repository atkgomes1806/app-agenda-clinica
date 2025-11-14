# 🚀 Instruções para Upload no GitHub

## 📋 Passo a passo para criar repositório no GitHub

### 1. Criar repositório no GitHub
1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito → **"New repository"**
3. Configure o repositório:
   - **Repository name**: `app-agenda-clinica`
   - **Description**: `Sistema de Agenda Clínica com Retenção Semestral - React + Supabase`
   - **Visibility**: `Private` ou `Public` (sua escolha)
   - ⚠️ **NÃO** marque "Add README file" (já temos um)
   - ⚠️ **NÃO** adicione .gitignore ou license (já configurados)
4. Clique em **"Create repository"**

### 2. Conectar repositório local com GitHub
Após criar o repositório, o GitHub mostrará instruções. Use os comandos abaixo:

```bash
# Adicionar origin remoto (substitua SEU_USERNAME pelo seu username)
git remote add origin https://github.com/SEU_USERNAME/app-agenda-clinica.git

# Fazer push do commit inicial
git branch -M main
git push -u origin main
```

### 3. Exemplo completo
Se seu username for `joaosilva`, os comandos seriam:
```bash
git remote add origin https://github.com/joaosilva/app-agenda-clinica.git
git branch -M main
git push -u origin main
```

## ✅ Verificações de Segurança

- ✅ Arquivo `.env` está no `.gitignore` (não será enviado)
- ✅ `node_modules/` está excluído
- ✅ Apenas ANON_KEY pública no código (sem SERVICE_ROLE_KEY)
- ✅ Nenhum dado sensível detectado

## 📁 O que será enviado

```
├── docs/                     # Documentação técnica
├── edge-functions/           # Edge Functions do Supabase
├── scripts/                  # Scripts SQL de configuração
├── src/                      # Código fonte React
├── .env.example             # Template de variáveis (sem valores reais)
├── .gitignore               # Configuração Git
├── README.md                # Documentação principal
├── package.json             # Dependências
└── vite.config.js          # Configuração Vite
```

## 🔐 Configuração pós-upload

Após o upload, configure no repositório GitHub:
1. **Secrets** (se repositório privado): adicione variáveis sensíveis
2. **Collaborators**: adicione colaboradores se necessário
3. **Branch protection**: configure regras de proteção da branch main

## 📝 Próximos commits

Para futuras alterações:
```bash
git add .
git commit -m "feat: descrição da alteração"
git push
```

---

**⚠️ IMPORTANTE**: Substitua `SEU_USERNAME` pelo seu username real do GitHub!