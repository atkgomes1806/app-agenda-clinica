# 🔧 Debug de Deploy no Vercel - Troubleshooting

## 🚨 **Problemas Comuns e Soluções**

### 1. 🔍 **Ferramentas de Debug do Vercel**

#### **A. Function Logs (Principal)**
1. **Vercel Dashboard** → Seu projeto → **Functions** tab
2. **View Function Logs** → Logs em tempo real
3. **Realtime Logs** → Stream de erros ao vivo

#### **B. Deployment Logs**  
1. **Deployments** → Clique no deploy com erro
2. **Building** → Logs de build completos
3. **Runtime Logs** → Erros de execução

#### **C. Analytics & Speed Insights**
1. **Analytics** → Performance e erros
2. **Speed Insights** → Métricas de carregamento

### 2. ⚙️ **Configurações Necessárias**

#### **A. Root Directory**
✅ **Configuração correta**: 
- Root Directory: `.` (raiz do repositório)
- Build Command: `npm run build`
- Output Directory: `dist`

#### **B. Configuração para React Router (SPA)**
**Problema**: URLs como `/agenda` retornam 404

**Solução**: Adicionar rewrites no `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist", 
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. 🔐 **Configuração de Autenticação Supabase**

#### **A. URLs do Supabase**
No **Supabase Dashboard** → **Authentication** → **URL Configuration**:

```
Site URL: https://SEU-APP.vercel.app
Redirect URLs: https://SEU-APP.vercel.app/**
```

#### **B. Variáveis de Ambiente**
Certifique-se que estão configuradas:
```
VITE_SUPABASE_URL=https://fholmqxtsfmljrbnwnbp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 🐛 **Debug Passo-a-Passo**

#### **Etapa 1: Verificar Build**
```bash
# Teste local primeiro
npm run build
npm run preview
```

#### **Etapa 2: Verificar Logs do Vercel**
1. **Deploy falhou**: Logs de Build
2. **Deploy ok, mas não carrega**: Runtime Logs  
3. **Carrega mas falha no login**: Function Logs

#### **Etapa 3: Verificar URLs**
- ✅ App carrega em `/`?
- ✅ Redireciona para `/login`?
- ✅ Após login vai para `/agenda`?
- ❌ URLs diretas (ex: `/agenda`) retornam 404?

### 5. 🚀 **Configuração Específica para este Projeto**

#### **A. Problema: React Router + SPA**
Sua app usa **BrowserRouter**, então URLs como `/agenda` precisam ser redirecionadas para `/index.html`.

#### **B. Solução: Atualizar vercel.json**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control", 
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 6. 📱 **Comandos de Debug**

#### **Debug Local (antes do deploy)**
```bash
# Build e teste
npm run build
npm run preview

# Teste variáveis de ambiente
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### **Debug Vercel CLI** (opcional)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy de desenvolvimento
vercel dev

# Logs do projeto
vercel logs SEU-APP-URL
```

### 7. ⚠️ **Checklist de Troubleshooting**

#### **Build/Deploy**
- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas 
- [ ] Framework detectado como "Vite"
- [ ] Output directory = `dist`

#### **Runtime**  
- [ ] URL base carrega (mostra "Carregando..." ou login)
- [ ] Console do navegador sem erros
- [ ] Network tab: requests para Supabase funcionam
- [ ] Authentication redirect funciona

#### **Supabase**
- [ ] Site URL configurada no Supabase
- [ ] Redirect URLs configuradas
- [ ] RLS policies permitem acesso
- [ ] Tabelas existem no banco

### 8. 🆘 **Soluções para Erros Específicos**

#### **Erro: "Cannot GET /agenda"**
```json
// Adicionar no vercel.json
"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
```

#### **Erro: "Failed to fetch" (Supabase)**
- Verificar variáveis de ambiente
- Verificar CORS no Supabase
- Verificar URL Configuration

#### **Erro: "Redirected too many times"**  
- Verificar Site URL no Supabase
- Verificar logic de redirect no código

#### **Erro: Tela branca**
- Verificar Console do navegador
- Verificar se React carregou
- Verificar importações de módulos

---

## 🎯 **Próximo Passo**

1. **Acesse seu app no Vercel**
2. **Abra DevTools (F12)**
3. **Vá para Console e Network tabs**
4. **Me envie os erros** que aparecem
5. **Verificarei os logs** do Vercel para você

Com essas informações, posso identificar exatamente qual é o problema!