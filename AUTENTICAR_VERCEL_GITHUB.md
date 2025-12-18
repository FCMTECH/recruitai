# 🔐 Como Autenticar Vercel no GitHub (OAuth)

## 🎯 **Objetivo**

Autorizar a aplica\u00e7\u00e3o Vercel a acessar seu reposit\u00f3rio GitHub atrav\u00e9s do sistema OAuth, garantindo que os deploys autom\u00e1ticos funcionem corretamente.

---

## 📋 **Por Que Isso \u00c9 Necess\u00e1rio?**

- ✅ Permite que a Vercel leia commits do reposit\u00f3rio
- ✅ Habilita webhooks autom\u00e1ticos GitHub → Vercel
- ✅ Garante que deploys iniciem ap\u00f3s cada push
- ✅ D\u00e1 permiss\u00f5es seguras e controladas \u00e0 Vercel

---

## 🔐 **Passo 1: Acessar Configura\u00e7\u00f5es do GitHub**

### **1.1 - Ir para Settings**

1. Acesse: **[https://github.com/settings/applications](https://github.com/settings/applications)**

2. Ou navegue manualmente:
   - Clique no seu **avatar** (canto superior direito do GitHub)
   - Clique em **"Settings"**
   - No menu lateral esquerdo, role at\u00e9 a se\u00e7\u00e3o **"Integrations"**
   - Clique em **"Applications"**

---

## 🔗 **Passo 2: Gerenciar Authorized OAuth Apps**

### **2.1 - Acessar a Aba Correta**

1. Na p\u00e1gina de Applications, voc\u00ea ver\u00e1 duas abas:
   - **Installed GitHub Apps**
   - **Authorized OAuth Apps** ← **Selecione esta!**

2. Clique na aba **"Authorized OAuth Apps"**

### **2.2 - Verificar se Vercel Est\u00e1 Autorizada**

Voc\u00ea deve ver uma lista de aplica\u00e7\u00f5es OAuth autorizadas.

**Procure por:**
- **Nome:** `Vercel`
- **\u00cdcone:** Logo da Vercel (tri\u00e2ngulo preto)
- **Permiss\u00f5es:** Acesso a reposit\u00f3rios

---

## ✅ **Cen\u00e1rio 1: Vercel J\u00c1 Est\u00e1 Autorizada**

Se voc\u00ea ver a **Vercel** na lista:

### **Verificar Permiss\u00f5es:**

1. Clique em **"Vercel"** na lista

2. Verifique as permiss\u00f5es concedidas:
```
✅ Acesso a reposit\u00f3rios p\u00fablicos e privados
✅ Ler metadados do reposit\u00f3rio
✅ Ler conte\u00fado do reposit\u00f3rio
✅ Webhooks
```

3. **Se as permiss\u00f5es estiverem corretas:**
   - Tudo est\u00e1 OK! ✅
   - A integra\u00e7\u00e3o j\u00e1 est\u00e1 ativa
   - Pule para o [Passo 4: Testar Integra\u00e7\u00e3o](#passo-4-testar-integra\u00e7\u00e3o)

4. **Se as permiss\u00f5es estiverem limitadas ou incorretas:**
   - Clique em **"Revoke access"**
   - V\u00e1 para o [Cen\u00e1rio 2](#cen\u00e1rio-2-vercel-n\u00e3o-est\u00e1-autorizada-ou-foi-revogada)

---

## ❌ **Cen\u00e1rio 2: Vercel N\u00c3O Est\u00e1 Autorizada (ou foi Revogada)**

Se a **Vercel** N\u00c3O aparecer na lista:

### **2.1 - Autorizar Via Painel da Vercel**

**A autoriza\u00e7\u00e3o OAuth precisa ser iniciada PELA VERCEL, n\u00e3o pelo GitHub.**

Siga estes passos:

1. **Acesse o painel da Vercel:**
   - V\u00e1 em: `https://vercel.com/fcm-techs-projects`

2. **Conectar Reposit\u00f3rio:**
   - Se voc\u00ea ainda n\u00e3o conectou o reposit\u00f3rio:
     - Clique em **"Add New..."** → **"Project"**
     - Clique em **"Import Git Repository"**
   
   - Se o projeto j\u00e1 existe:
     - V\u00e1 em: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`
     - Se n\u00e3o houver reposit\u00f3rio conectado, clique em **"Connect Git Repository"**

3. **Autorizar GitHub:**
   - A Vercel vai solicitar autoriza\u00e7\u00e3o para acessar sua conta GitHub
   - Uma janela pop-up do GitHub vai abrir
   - Voc\u00ea ver\u00e1 uma tela pedindo permiss\u00f5es:

```
Vercel by Vercel wants to access your FCMTECH account

This application will be able to:

✅ Read access to metadata and code
✅ Read and write access to administration, code, commit statuses,
   deployments, and pull requests

Authorize Vercel    [Bot\u00e3o Verde]
```

4. **Clique em "Authorize Vercel"** (bot\u00e3o verde)

5. **Confirmar Senha (se solicitado):**
   - O GitHub pode pedir sua senha para confirmar
   - Digite sua senha do GitHub
   - Clique em **"Confirm"**

6. **Selecionar Reposit\u00f3rio:**
   - Ap\u00f3s autorizar, selecione: **`FCMTECH/recruitai`**
   - Clique em **"Import"**

---

## 🔧 **Passo 3: Configurar Reposit\u00f3rio na Vercel**

Ap\u00f3s autorizar e importar:

### **3.1 - Configurar Root Directory**

1. **N\u00c3O CLIQUE EM "DEPLOY" AINDA!**

2. Em **"Configure Project"**:
   - **Framework Preset:** `Next.js` ✅
   - **Root Directory:** `nextjs_space` ← **CR\u00cdTICO!**
   - **Build Command:** (deixe vazio)
   - **Install Command:** (deixe vazio)
   - **Output Directory:** (deixe vazio)

3. **Adicionar Environment Variables:**
   - Clique em **"Environment Variables"**
   - Adicione TODAS as vari\u00e1veis do arquivo `IMPORTAR_VERCEL.txt`
   - Marque: **Production**, **Preview**, **Development**

4. **Agora sim, clique em "Deploy"**

---

## ✅ **Passo 4: Testar Integra\u00e7\u00e3o**

### **4.1 - Verificar no GitHub**

1. V\u00e1 em: `https://github.com/settings/applications`

2. Clique na aba **"Authorized OAuth Apps"**

3. Voc\u00ea DEVE ver **"Vercel"** na lista agora ✅

4. Clique em **"Vercel"** para ver detalhes:
```
Vercel
by Vercel

Authorized on: [data de hoje]

Permissions:
✅ Repositories: All repositories
✅ Organization access: Read-only
```

### **4.2 - Verificar Webhook**

1. V\u00e1 em: `https://github.com/FCMTECH/recruitai/settings/hooks`

2. Voc\u00ea DEVE ver um webhook da Vercel:
```
https://api.vercel.com/v1/integrations/deploy/...
✅ Active
Recent Deliveries: [v\u00e1rios com status 200]
```

### **4.3 - Testar Deploy Autom\u00e1tico**

```bash
cd /caminho/do/projeto
git commit --allow-empty -m "Test: Verify Vercel OAuth integration"
git push origin main
```

**Aguarde 1-2 minutos e verifique:**
- `https://vercel.com/fcm-techs-projects/recruitai/deployments`
- Um novo deploy deve ter iniciado automaticamente ✅

---

## 🔍 **Verificar Permiss\u00f5es Detalhadas**

### **No GitHub:**

1. V\u00e1 em: `https://github.com/settings/applications`

2. Clique na aba **"Authorized OAuth Apps"**

3. Clique em **"Vercel"**

4. Role at\u00e9 **"Permissions"**

Voc\u00ea deve ver:

```
Repository permissions:
✅ Contents: Read-only
✅ Metadata: Read-only
✅ Pull requests: Read and write
✅ Commit statuses: Read and write
✅ Deployments: Read and write
✅ Webhooks: Read and write

Organization permissions:
✅ Members: Read-only
```

---

## ⚠️ **Solu\u00e7\u00e3o de Problemas**

### **Problema 1: Bot\u00e3o "Authorize" N\u00e3o Aparece**

**Solu\u00e7\u00e3o:**
1. Desabilite bloqueadores de pop-up no navegador
2. Limpe cache e cookies
3. Tente em modo an\u00f4nimo/privado
4. Use outro navegador (Chrome, Firefox, Edge)

### **Problema 2: Erro "OAuth Application Suspended"**

**Solu\u00e7\u00e3o:**
1. V\u00e1 em: `https://vercel.com/support`
2. Reporte o problema
3. Aguarde resposta do suporte da Vercel

### **Problema 3: Autoriza\u00e7\u00e3o Completa, Mas Deploy N\u00e3o Inicia**

**Solu\u00e7\u00e3o:**
1. Verifique o webhook:
   - `https://github.com/FCMTECH/recruitai/settings/hooks`
   - Deve estar **Active** ✅

2. Recrie a conex\u00e3o:
   - `https://vercel.com/fcm-techs-projects/recruitai/settings/git`
   - Clique em **"Disconnect"**
   - Clique em **"Connect Git Repository"**
   - Selecione **`FCMTECH/recruitai`** novamente

3. Teste novamente:
```bash
git commit --allow-empty -m "Test: Recreated connection"
git push origin main
```

### **Problema 4: "Repository Access Denied"**

**Solu\u00e7\u00e3o:**
1. V\u00e1 em: `https://github.com/settings/applications`
2. Clique em **"Vercel"**
3. Role at\u00e9 **"Repository access"**
4. Selecione: **"All repositories"** ou **"Only select repositories"**
5. Se **"Only select repositories"**:
   - Marque: **`FCMTECH/recruitai`** ✅
6. Clique em **"Save"**

---

## 🔒 **Seguran\u00e7a e Melhores Pr\u00e1ticas**

### **O Que a Vercel PODE Fazer:**
✅ Ler c\u00f3digo do reposit\u00f3rio
✅ Criar webhooks para deploy
✅ Atualizar status de commits
✅ Ler metadata de pull requests

### **O Que a Vercel N\u00c3O PODE Fazer:**
❌ Deletar ou modificar c\u00f3digo
❌ Criar/deletar branches
❌ Fazer commits no reposit\u00f3rio
❌ Alterar configura\u00e7\u00f5es do reposit\u00f3rio
❌ Convidar/remover colaboradores

### **Revogar Acesso (Se Necess\u00e1rio):**

1. V\u00e1 em: `https://github.com/settings/applications`
2. Clique na aba **"Authorized OAuth Apps"**
3. Clique em **"Vercel"**
4. Role at\u00e9 o final da p\u00e1gina
5. Clique em **"Revoke access"**
6. Confirme a revoga\u00e7\u00e3o

**Nota:** Isso interromper\u00e1 os deploys autom\u00e1ticos!

---

## ✅ **Checklist de Valida\u00e7\u00e3o**

Confirme que todos estes itens est\u00e3o **✅**:

- [ ] Vercel aparece em `Authorized OAuth Apps`
- [ ] Permiss\u00f5es corretas concedidas
- [ ] Reposit\u00f3rio `FCMTECH/recruitai` conectado na Vercel
- [ ] Root Directory configurado como `nextjs_space`
- [ ] Webhook ativo em `github.com/FCMTECH/recruitai/settings/hooks`
- [ ] Deploy autom\u00e1tico testado e funcionando
- [ ] Commit de teste disparou novo deploy
- [ ] Site acess\u00edvel em `https://www.recruitai.com.br`

---

## 📊 **Resumo Visual**

```
┌─────────────────┐
│   Voc\u00ea (GitHub) │
└────────┬────────┘
         │
         │ Autoriza OAuth
         ▼
┌─────────────────┐       ┌─────────────────┐
│     Vercel      │◄──────┤   GitHub API    │
└────────┬────────┘       └─────────────────┘
         │
         │ L\u00ea commits via OAuth
         ▼
┌─────────────────┐
│   Deploy Auto   │
└─────────────────┘
```

---

## 🎉 **Ap\u00f3s Autoriza\u00e7\u00e3o Bem-Sucedida**

### **Fluxo Completo:**

1. **Voc\u00ea faz commit:**
```bash
git commit -m "Nova feature"
git push origin main
```

2. **GitHub detecta push:**
   - Envia notifica\u00e7\u00e3o via webhook

3. **Vercel recebe notifica\u00e7\u00e3o:**
   - L\u00ea o novo commit (via OAuth)
   - Inicia build automaticamente

4. **Deploy completa:**
   - Site atualizado em `https://www.recruitai.com.br`

**Total:** ~5-7 minutos ⚡

---

## 📚 **Links \u00dateis**

- **GitHub OAuth Apps:** `https://github.com/settings/applications`
- **Vercel Project Settings:** `https://vercel.com/fcm-techs-projects/recruitai/settings`
- **Webhooks GitHub:** `https://github.com/FCMTECH/recruitai/settings/hooks`
- **Vercel Deployments:** `https://vercel.com/fcm-techs-projects/recruitai/deployments`
- **Vercel Docs - GitHub Integration:** `https://vercel.com/docs/deployments/git/vercel-for-github`

---

**Data:** 17/12/2025 - 21:35  
**Status:** Aguardando autoriza\u00e7\u00e3o OAuth manual do usu\u00e1rio  
**Pr\u00f3xima A\u00e7\u00e3o:** Seguir passos 1-4 deste guia  
