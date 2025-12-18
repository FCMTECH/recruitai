# 🚀 SOLUÇÃO DEFINITIVA: Webhook Vercel → GitHub

## 🎯 **Problema Identificado**

O webhook da Vercel **NÃO ESTÁ CONFIGURADO** em:
`https://github.com/FCMTECH/recruitai/settings/hooks`

**Isso explica por que os deploys não iniciam automaticamente!**

---

## ✅ **SOLUÇÃO AUTOMÁTICA (Recomendada)**

O webhook é criado **AUTOMATICAMENTE** pela Vercel quando você conecta o repositório.

### **Passo 1: Desconectar Repositório (Se Já Conectado)**

1. Acesse: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`

2. Se houver um repositório conectado, você verá:
```
Connected Git Repository
FCMTECH/recruitai
```

3. Clique no botão **"Disconnect"** (vermelho)

4. Confirme a desconexão

---

### **Passo 2: Reconectar Repositório (Cria Webhook Automaticamente)**

1. Na mesma página: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`

2. Clique em **"Connect Git Repository"**

3. Selecione: **"GitHub"**

4. **IMPORTANTE:** Uma janela pop-up do GitHub vai abrir pedindo autorização OAuth

5. **Autorize a Vercel** (se solicitado):
   - Clique em **"Authorize Vercel"** (botão verde)
   - Confirme sua senha do GitHub (se necessário)

6. **Selecione o repositório:**
   - Procure e selecione: **`FCMTECH/recruitai`**
   - Clique em **"Import"** ou **"Connect"**

7. **Configure o projeto:**
   - **Root Directory:** `nextjs_space` ⬅️ **CRÍTICO!**
   - **Framework Preset:** `Next.js`
   - **Build Command:** (deixe vazio)
   - **Install Command:** (deixe vazio)

8. **NÃO CLIQUE EM DEPLOY AINDA!**

---

### **Passo 3: Verificar Criação do Webhook**

1. Aguarde 10-15 segundos após conectar

2. Acesse: `https://github.com/FCMTECH/recruitai/settings/hooks`

3. Você DEVE ver um novo webhook:
```
https://api.vercel.com/v1/integrations/deploy/...
✅ Active
Events: Push, Branch or tag creation, Pull request
```

4. **Se o webhook aparecer:** ✅ SUCESSO!

5. **Se o webhook NÃO aparecer:** ⚠️ Vá para a solução alternativa abaixo

---

### **Passo 4: Adicionar Variáveis de Ambiente**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/environment-variables`

2. Adicione **TODAS** as variáveis do arquivo `IMPORTAR_VERCEL.txt`

3. Para cada variável:
   - Marque: **Production**, **Preview**, **Development**
   - Clique em **"Save"**

---

### **Passo 5: Fazer Deploy Manual (Primeira Vez)**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai`

2. Clique em **"Deploy"** (ou **"Redeploy"**)

3. Aguarde 5-7 minutos

4. Verifique se o build passa sem erros

---

### **Passo 6: Testar Webhook (Deploy Automático)**

```bash
cd /caminho/do/projeto
git commit --allow-empty -m "Test: Verify webhook auto-deploy"
git push origin main
```

**Aguarde 1-2 minutos e verifique:**
- `https://vercel.com/fcm-techs-projects/recruitai/deployments`
- Um **novo deploy deve iniciar automaticamente** ✅

---

## ⚙️ **SOLUÇÃO ALTERNATIVA (Manual - Apenas se Automática Falhar)**

### **Criar Webhook Manualmente no GitHub**

**⚠️ USE ESTA OPÇÃO APENAS SE A SOLUÇÃO AUTOMÁTICA NÃO FUNCIONAR!**

1. **Obter URL do Webhook da Vercel:**
   - Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`
   - Procure por: **"Deploy Hook"** ou **"Webhook URL"**
   - Copie a URL (algo como: `https://api.vercel.com/v1/integrations/deploy/prj_...`)

2. **Criar Webhook no GitHub:**
   - Acesse: `https://github.com/FCMTECH/recruitai/settings/hooks`
   - Clique em **"Add webhook"**

3. **Configurar Webhook:**
```
Payload URL: [Cole a URL copiada da Vercel]
Content type: application/json
Secret: (deixe vazio)
SSL verification: Enable SSL verification ✅
```

4. **Selecionar Eventos:**
   - Marque: **"Just the push event"** ✅
   - OU selecione eventos específicos:
     - ✅ Pushes
     - ✅ Branch or tag creation
     - ✅ Pull requests (opcional)

5. **Ativar Webhook:**
   - Marque: **Active** ✅
   - Clique em **"Add webhook"**

6. **Testar:**
```bash
git commit --allow-empty -m "Test: Manual webhook"
git push origin main
```

---

## 🔍 **Verificar Status do Webhook**

### **No GitHub:**

1. Acesse: `https://github.com/FCMTECH/recruitai/settings/hooks`

2. Clique no webhook da Vercel

3. Vá na aba **"Recent Deliveries"**

4. Você deve ver entregas com:
```
Status: 200 OK ✅
Timestamp: [recente]
```

5. **Se ver status 200:** ✅ Webhook funcionando!

6. **Se ver erros (4xx, 5xx):** ⚠️ Webhook com problemas

---

## ⚠️ **Solução de Problemas**

### **Problema 1: Webhook não é criado após conectar**

**Causa:** Falta de permissões OAuth

**Solução:**
1. Desconecte o repositório na Vercel
2. Revogue autorização OAuth:
   - `https://github.com/settings/applications`
   - Aba: **"Authorized OAuth Apps"**
   - Procure por **"Vercel"**
   - Clique em **"Revoke access"**
3. Reconecte o repositório na Vercel (vai pedir autorização novamente)
4. **Desta vez, conceda TODAS as permissões solicitadas**

### **Problema 2: Webhook retorna erro 404**

**Causa:** URL do webhook incorreta

**Solução:**
1. Delete o webhook no GitHub
2. Desconecte e reconecte o repositório na Vercel
3. Deixe a Vercel criar o webhook automaticamente

### **Problema 3: Deploy não inicia mesmo com webhook ativo**

**Causa:** Branch incorreta configurada

**Solução:**
1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`
2. Verifique: **"Production Branch"**
3. Deve estar: **`main`** ✅
4. Se estiver diferente, altere para **`main`**
5. Salve e teste novamente

### **Problema 4: Webhook criado mas entregas falham**

**Causa:** Projeto não configurado corretamente na Vercel

**Solução:**
1. Verifique: **Root Directory** = `nextjs_space`
2. Verifique: **Framework Preset** = `Next.js`
3. Verifique: Todas as variáveis de ambiente estão configuradas
4. Faça um deploy manual primeiro
5. Depois teste o webhook novamente

---

## ✅ **Checklist de Validação**

Confirme que todos estes itens estão **✅**:

- [ ] Repositório `FCMTECH/recruitai` conectado na Vercel
- [ ] Webhook da Vercel visível em `github.com/FCMTECH/recruitai/settings/hooks`
- [ ] Webhook status: **Active** ✅
- [ ] Production Branch: **main**
- [ ] Root Directory: **nextjs_space**
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Deploy manual completo com sucesso
- [ ] Commit de teste disparou deploy automático
- [ ] Recent Deliveries mostra status 200 OK
- [ ] Site acessível em `https://www.recruitai.com.br`

---

## 📊 **Como Deve Funcionar (Fluxo Completo)**

```
1. Você faz commit
   ↓
   git push origin main
   ↓
2. GitHub detecta push
   ↓
   Envia payload para webhook
   ↓
3. Vercel recebe notificação
   ↓
   https://api.vercel.com/v1/integrations/deploy/...
   ↓
4. Vercel clona commit mais recente
   ↓
   git clone --branch main ...
   ↓
5. Vercel executa build
   ↓
   yarn install && yarn build
   ↓
6. Deploy completa
   ↓
   Site atualizado em https://www.recruitai.com.br
```

**Tempo total:** ~5-7 minutos ⚡

---

## 🎯 **Por Que o Webhook Não Existia Antes?**

Possíveis razões:

1. **Projeto criado manualmente** (não importado do GitHub)
2. **Conexão OAuth não estabelecida** corretamente
3. **Permissões insuficientes** durante autorização
4. **Webhook foi deletado** acidentalmente
5. **Projeto desconectado** do GitHub em algum momento

---

## 💡 **Dicas Importantes**

### **1. Permissões OAuth Necessárias**

Quando autorizar a Vercel, ela pedirá:
```
✅ Read access to metadata and code
✅ Read and write access to:
   - Administration
   - Code
   - Commit statuses
   - Deployments
   - Pull requests
   - Webhooks ← ESSENCIAL!
```

**Conceda TODAS as permissões!**

### **2. Não Delete o Webhook Manualmente**

- O webhook é gerenciado pela Vercel
- Se deletar, reconecte o repositório na Vercel
- Ela criará um novo automaticamente

### **3. Múltiplos Webhooks**

Se houver múltiplos webhooks da Vercel:
- Delete os antigos/inativos
- Mantenha apenas o mais recente

### **4. Teste Regularmente**

Faça commits de teste periodicamente:
```bash
git commit --allow-empty -m "Test: Deploy automation"
git push origin main
```

---

## 📚 **Links Úteis**

- **Vercel Git Settings:** `https://vercel.com/fcm-techs-projects/recruitai/settings/git`
- **GitHub Webhooks:** `https://github.com/FCMTECH/recruitai/settings/hooks`
- **GitHub OAuth Apps:** `https://github.com/settings/applications`
- **Vercel Deployments:** `https://vercel.com/fcm-techs-projects/recruitai/deployments`
- **Vercel Docs:** `https://vercel.com/docs/deployments/git/vercel-for-github`

---

## 🎉 **Após Configurar com Sucesso**

### **O que você pode fazer:**

1. **Desenvolvimento normal:**
```bash
# Editar código
vim app/exemplo.tsx

# Commit e push
git add .
git commit -m "Nova feature"
git push origin main

# Deploy acontece automaticamente! ✨
```

2. **Monitorar deploys:**
   - Acompanhe em tempo real na Vercel
   - Receba notificações por email (se configurado)
   - Veja logs detalhados de build

3. **Rollback fácil:**
   - Todos os deploys ficam salvos
   - Rollback com 1 clique se necessário

---

**Data:** 17/12/2025 - 21:50  
**Status:** Aguardando reconexão do repositório  
**Próxima Ação:** Seguir Passo 1-6 da Solução Automática  
**Tempo Estimado:** 5-10 minutos  
