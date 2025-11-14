# 🚀 Deploy no Vercel - Configuração

## 📋 Variáveis de Ambiente Necessárias

Para fazer deploy no Vercel, você precisa configurar as seguintes variáveis de ambiente:

### ⚙️ Variáveis Obrigatórias

| Variável | Valor | Onde encontrar |
|----------|-------|----------------|
| `VITE_SUPABASE_URL` | `https://fholmqxtsfmljrbnwnbp.supabase.co` | Dashboard Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZob2xtcXh0c2ZtbGpyYm53bmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjgzNDcsImV4cCI6MjA3ODA0NDM0N30.n7y1HIehJr9gZjZH6TYqG7_NdCd17hO7NW-gGBH6JmE` | Dashboard Supabase → Settings → API |

## 🔧 Como Configurar no Vercel

### Método 1: Durante o Deploy
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Conecte sua conta GitHub
3. Importe o repositório `app-agenda-clinica`
4. Na tela de configuração, adicione as variáveis em **Environment Variables**
5. Clique em **Deploy**

### Método 2: Após o Deploy
1. Vá ao dashboard do projeto no Vercel
2. Clique em **Settings** → **Environment Variables**

**Opção A - Importar arquivo .env:**
- Clique em **"Import .env File"** 
- Faça upload do seu arquivo `.env` local (não o `.env.example`)
- Selecione: Production, Preview, Development
- Clique **Save**

**Opção B - Manual:**
3. Adicione cada variável:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://fholmqxtsfmljrbnwnbp.supabase.co`
   - Environment: Production, Preview, Development (marque todos)
4. Repita para `VITE_SUPABASE_ANON_KEY`
5. Faça um novo deploy: **Deployments** → **Redeploy**

## 📱 Configuração Passo-a-Passo

### 1. Preparação
```bash
# Certifique-se que está na branch main
git status

# Se houver alterações, commite primeiro
git add .
git commit -m "feat: preparar para deploy vercel"
git push
```

### 2. Deploy no Vercel
1. **Conectar GitHub**: Autorize o Vercel a acessar seus repositórios
2. **Selecionar Repo**: Escolha `atkgomes1806/app-agenda-clinica`
3. **Configurar Projeto**:
   - Project Name: `app-agenda-clinica`
   - Framework Preset: `Vite` (deve detectar automaticamente)
   - Build Command: `npm run build` (padrão)
   - Output Directory: `dist` (padrão)

### 3. Variáveis de Ambiente
```
VITE_SUPABASE_URL=https://fholmqxtsfmljrbnwnbp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZob2xtcXh0c2ZtbGpyYm53bmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjgzNDcsImV4cCI6MjA3ODA0NDM0N30.n7y1HIehJr9gZjZH6TYqG7_NdCd17hO7NW-gGBH6JmE
```

## ⚡ Configuração Automática no Vercel

Para facilitar, você pode criar um arquivo `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@vite_supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@vite_supabase_anon_key"
  }
}
```

## 🔐 Segurança

### ✅ Seguro para expor
- `VITE_SUPABASE_URL`: URL pública do projeto
- `VITE_SUPABASE_ANON_KEY`: Chave pública (limitada por RLS)

### ❌ NÃO expor
- `SUPABASE_SERVICE_ROLE_KEY`: Só para Edge Functions
- Senhas ou tokens privados

## 🌐 Configuração de Domínio Supabase

No Supabase, adicione o domínio do Vercel:
1. Dashboard Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: Adicione a URL do Vercel (ex: `https://app-agenda-clinica.vercel.app`)
3. **Redirect URLs**: Adicione `https://app-agenda-clinica.vercel.app/**`

## 🎯 Resultado Final

Após o deploy, sua aplicação estará disponível em:
`https://app-agenda-clinica-[hash].vercel.app`

O Vercel fornecerá a URL exata após o deploy.

## 🔄 Deploy Automático

O Vercel configurará deploy automático:
- **Push na main**: Deploy em produção
- **Pull requests**: Deploy de preview
- **Branches**: Deploy de preview

---

## ⚠️ Troubleshooting

### Erro de Build
```bash
# Teste local antes do deploy
npm run build
npm run preview
```

### Erro de Variáveis
- Certifique-se que as variáveis começam com `VITE_`
- Verifique se não há espaços extras
- Redeploy após adicionar variáveis

### Erro 404 no Supabase
- Verifique a URL no Authentication → URL Configuration
- Certifique-se que as políticas RLS estão corretas