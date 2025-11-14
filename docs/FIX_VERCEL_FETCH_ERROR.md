# 🔧 Fix: "Failed to execute 'fetch'" - Debug do Vercel

## 🚨 **Problema Identificado**

O erro `Failed to execute 'fetch' on 'Window': Invalid value` indica que as **variáveis de ambiente** não estão chegando corretamente ao Vercel.

## 🔍 **Debug Rápido**

### 1. **Verificar no Console do Navegador**

Abra **DevTools (F12)** → **Console** e digite:
```javascript
// Verificar as variáveis
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Resultado esperado:**
```
SUPABASE_URL: https://fholmqxtsfmljrbnwnbp.supabase.co
SUPABASE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**❌ Se aparecer `undefined`** = Variáveis não configuradas!

### 2. **Solução Imediata**

#### **A. Verificar Configuração no Vercel**
1. **Vercel Dashboard** → Seu projeto → **Settings**
2. **Environment Variables**
3. Verificar se existem:
   - `VITE_SUPABASE_URL` 
   - `VITE_SUPABASE_ANON_KEY`
4. **Environment**: Marcar **Production**, **Preview**, **Development**

#### **B. Re-importar .env File**
1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Import .env File** (botão azul)
3. Upload do seu arquivo `.env` local
4. **Save** → **Deployments** → **Redeploy**

### 3. **Valores Corretos**

Certifique-se que as variáveis têm exatamente estes valores:

```env
VITE_SUPABASE_URL=https://fholmqxtsfmljrbnwnbp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZob2xtcXh0c2ZtbGpyYm53bmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjgzNDcsImV4cCI6MjA3ODA0NDM0N30.n7y1HIehJr9gZjZH6TYqG7_NdCd17hO7NW-gGBH6JmE
```

### 4. **Redeploy Obrigatório**

Após adicionar/corrigir variáveis:
1. **Deployments** → **View Function Logs** 
2. **Redeploy** (botão ⏯)
3. Aguardar novo deploy completar

### 5. **Verificação Final**

Após redeploy, teste:
1. **URL do app** carrega
2. **Console** sem erros `fetch`
3. **Login** funciona
4. **Network tab** mostra requests para Supabase

---

## 🎯 **Ação Imediata**

1. **Acesse Vercel Dashboard**
2. **Vá em Environment Variables**  
3. **Adicione as 2 variáveis** (valores exatos acima)
4. **Marque todos os ambientes**
5. **Redeploy**
6. **Teste novamente**

Se o erro persistir, me envie print das variáveis configuradas no Vercel!