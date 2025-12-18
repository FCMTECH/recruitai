# 🚀 Guia Completo: Deploy Automático GitHub → Vercel

## 🎯 **Visão Geral**

Este guia cobre **TODO** o processo de deploy do RecruitAI, desde a configuração inicial até o monitoramento de produção.

---

## 📋 **Sumário**

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração do Git](#2-configuração-do-git)
3. [Configuração do GitHub](#3-configuração-do-github)
4. [Configuração da Vercel](#4-configuração-da-vercel)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)
6. [Deploy Inicial](#6-deploy-inicial)
7. [Configuração de Banco de Dados](#7-configuração-de-banco-de-dados)
8. [Configuração do Stripe](#8-configuração-do-stripe)
9. [Testes](#9-testes)
10. [Monitoramento](#10-monitoramento)

---

## **1. Pré-requisitos**

### **1.1 - Contas Necessárias**

- ✅ **GitHub Account:** `FCMTECH` (já configurado)
- ✅ **Vercel Account:** Vinculada ao GitHub
- ✅ **Supabase Account:** Para banco de dados PostgreSQL
- ✅ **Stripe Account:** Para pagamentos
- ✅ **AWS Account:** Para armazenamento S3 (currículos)
- ✅ **Domínio:** `www.recruitai.com.br` (já configurado)

### **1.2 - Ferramentas Locais**

```bash
# Verificar instalações
node --version   # v18+
yarn --version   # 1.22+
git --version    # 2.0+
```

---

## **2. Configuração do Git**

### **2.1 - Configurar Identidade Global**

```bash
git config --global user.name "FCMTECH"
git config --global user.email "comercial.fcmtech@gmail.com"
```

### **2.2 - Verificar Configuração**

```bash
git config --global --list | grep user
```

**Output esperado:**
```
user.name=FCMTECH
user.email=comercial.fcmtech@gmail.com
```

### **2.3 - Configurar .gitignore**

Confirme que o `.gitignore` inclui:

```gitignore
node_modules/
.next/
.env
.env.local
.vercel
*.log
yarn-error.log
.DS_Store
```

---

## **3. Configuração do GitHub**

### **3.1 - Verificar Email**

1. Vá em: `https://github.com/settings/emails`
2. Confirme que `comercial.fcmtech@gmail.com` está **verificado**
3. Se não, clique em **"Verify email address"**

### **3.2 - Verificar Repositório**

1. URL: `https://github.com/FCMTECH/recruitai`
2. Branch principal: `main`
3. Visibilidade: Privado

### **3.3 - Configurar Branch Protection (Opcional)**

1. Vá em: `https://github.com/FCMTECH/recruitai/settings/branches`
2. Adicione regra para `main`:
   - ✅ Require pull request reviews (opcional)
   - ✅ Require status checks to pass

---

## **4. Configuração da Vercel**

### **4.1 - Criar Projeto (Se Não Existe)**

1. Acesse: `https://vercel.com/new`
2. Clique em **"Import Git Repository"**
3. Selecione: `FCMTECH/recruitai`
4. **NÃO CLIQUE EM DEPLOY AINDA!**

### **4.2 - Configurar Build Settings**

**Framework Preset:** `Next.js`

**Root Directory:** `nextjs_space` ← **CRÍTICO!**

**Build Command:** (deixe vazio)

**Install Command:** (deixe vazio)

**Output Directory:** (deixe vazio)

### **4.3 - Configurar Domínio**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/domains`

2. Adicione domínio: `www.recruitai.com.br`

3. Copie os registros DNS fornecidos

4. Configure no seu provedor de DNS:
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

5. Aguarde propagação DNS (até 24h)

---

## **5. Variáveis de Ambiente**

### **5.1 - Adicionar na Vercel**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/environment-variables`

2. Adicione **TODAS** estas variáveis:

```env
# DATABASE
DATABASE_URL=postgresql://postgres.kcjqwtyijwomekdfgvul:nP8MxRMEW5KQx0oZ@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# NEXTAUTH
NEXTAUTH_SECRET=f8e6b3d9c7a4e5f2b1d8c9a7e6f5d4c3b2a1f9e8d7c6b5a4f3e2d1c0b9a8f7e6
NEXTAUTH_URL=https://www.recruitai.com.br

# STRIPE
STRIPE_SECRET_KEY=sk_test_51QXrm0L4nYV3eIxtxq0hFbKxzPJmNZ8w1xvE9GQYmKLp3zN2fR7sT1wV4yC6hB8jD9kF0lG2mH5nI7oJ1pK3qL4rM6sN8tO0uP2vQ
STRIPE_PUBLISHABLE_KEY=pk_test_51QXrm0L4nYV3eIxtZT9FWQK3xvE9GQYmKLp3zN2fR7sT1wV4yC6hB8jD9kF0lG2mH5nI7oJ1pK3qL4rM6sN8tO0uP2vQ
STRIPE_WEBHOOK_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=AKIAZI5YPLQFXH2X3KAW
AWS_SECRET_ACCESS_KEY=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
AWS_S3_REGION=us-east-2
AWS_S3_BUCKET_NAME=recruitai-resumes
AWS_S3_FOLDER_PREFIX=resumes/

# ABACUS AI
ABACUSAI_API_KEY=sk-77b088f1fdc747d683df1e41f0e2cf2d5c26af6e9a74

# EMAIL (SMTP)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=noreply@recruitai.com.br
SMTP_PASS=aKp7@mN9#xT2$wQ5
SMTP_FROM_NAME=RecruitAI

# OAUTH (Opcional)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
LINKEDIN_CLIENT_ID=YOUR_LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET=YOUR_LINKEDIN_CLIENT_SECRET

# MAINTENANCE
TEST_MODE_EMAIL=teste@fcmtech.com.br
MAINTENANCE_SECRET=3977aa7046e9bf25ce7e91d535177b4c00794ec8fd29b98b5fc5a2697a455c1e
```

3. Para cada variável:
   - Environment: **Production**, **Preview**, **Development** (todas marcadas)
   - Clique em **"Save"**

---

## **6. Deploy Inicial**

### **6.1 - Fazer Deploy Manual**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai`

2. Clique em **"Deploy"** (pela primeira vez)

3. Aguarde 5-7 minutos

4. Verifique logs:
```
✅ Cloning github.com/FCMTECH/recruitai
✅ Running "install" command: yarn install...
✅ success Saved lockfile.
✅ Running "build" command: next build
✅ Compiled successfully
✅ Type checking passed
✅ Generating static pages (39/39)
```

### **6.2 - Verificar Deploy**

1. Status deve ser: **🟢 Ready**

2. Acesse: `https://www.recruitai.com.br`

3. Você deve ver a página inicial do RecruitAI

---

## **7. Configuração de Banco de Dados**

### **7.1 - Aplicar Schema**

```powershell
$headers = @{
    "Authorization" = "Bearer 3977aa7046e9bf25ce7e91d535177b4c00794ec8fd29b98b5fc5a2697a455c1e"
    "Content-Type" = "application/json"
}
$body = @{ action = "prisma_push" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://www.recruitai.com.br/api/maintenance/execute" -Method POST -Headers $headers -Body $body
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Schema aplicado com sucesso"
}
```

### **7.2 - Popular Dados Iniciais (Seed)**

```powershell
$headers = @{
    "Authorization" = "Bearer 3977aa7046e9bf25ce7e91d535177b4c00794ec8fd29b98b5fc5a2697a455c1e"
    "Content-Type" = "application/json"
}
$body = @{ action = "run_seed" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://www.recruitai.com.br/api/maintenance/execute" -Method POST -Headers $headers -Body $body
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Seed executado com sucesso"
}
```

---

## **8. Configuração do Stripe**

### **8.1 - Criar Webhook**

1. Vá em: `https://dashboard.stripe.com/webhooks`

2. Clique em **"Add endpoint"**

3. Configure:
```
Endpoint URL: https://www.recruitai.com.br/api/webhooks/stripe
Description: RecruitAI Production Webhook
```

4. Selecione estes eventos:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`

5. Clique em **"Add endpoint"**

### **8.2 - Obter Signing Secret**

1. Copie o **"Signing secret"**

2. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/environment-variables`

3. Edite `STRIPE_WEBHOOK_SECRET`

4. Cole o signing secret

5. Clique em **"Save"**

### **8.3 - Redeploy**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/deployments`

2. Clique no deploy mais recente

3. Clique em **"Redeploy"**

4. Aguarde 5-7 minutos

---

## **9. Testes**

### **9.1 - Teste de Login (Admin)**

1. Acesse: `https://www.recruitai.com.br/auth/signin`

2. Email: `admin@recruitai.com`

3. Senha: `admin123`

4. Você deve ser redirecionado para: `/admin`

### **9.2 - Teste de Login (Empresa)**

1. Acesse: `https://www.recruitai.com.br/auth/signin`

2. Email: `comercial.fcmtech@gmail.com`

3. Senha: `fcmtech123`

4. Você deve ser redirecionado para: `/dashboard`

### **9.3 - Teste de Login (Candidato)**

1. Acesse: `https://www.recruitai.com.br/auth/signin`

2. Email: `candidato@teste.com`

3. Senha: `candidato123`

4. Você deve ser redirecionado para: `/candidate/dashboard`

### **9.4 - Teste de Deploy Automático**

```bash
cd /caminho/do/projeto
git commit --allow-empty -m "Test: Auto-deploy trigger"
git push origin main
```

Aguarde 2-3 minutos e verifique:
- Novo deploy iniciou automaticamente na Vercel
- Deploy completou com sucesso

---

## **10. Monitoramento**

### **10.1 - Logs da Vercel**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/deployments`

2. Clique em um deploy

3. Visualize logs de:
   - Build
   - Runtime
   - Functions

### **10.2 - Monitorar Performance**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/analytics`

2. Monitore:
   - Tempo de carregamento
   - Taxa de erro
   - Uso de banda

### **10.3 - Alertas**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/notifications`

2. Ative:
   - ✅ Deployment Ready
   - ✅ Deployment Failed
   - ✅ Domain Configuration Changed

---

## ✅ **Checklist Final**

- [ ] Git configurado com autor correto
- [ ] Email verificado no GitHub
- [ ] Repositório conectado à Vercel
- [ ] Root Directory: `nextjs_space`
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Deploy inicial completado com sucesso
- [ ] Schema de banco aplicado
- [ ] Seed executado
- [ ] Webhook do Stripe configurado
- [ ] Logins testados (admin, empresa, candidato)
- [ ] Deploy automático testado e funcionando
- [ ] Domínio apontando corretamente
- [ ] Site acessível em: `https://www.recruitai.com.br`

---

## 📚 **Documentação Relacionada**

- `STRIPE_SETUP.md` - Configuração detalhada do Stripe
- `AWS_S3_CONFIG.md` - Configuração do S3 para currículos
- `GITHUB_SETUP.md` - Configuração detalhada do GitHub
- `API_MANUTENCAO.md` - API de manutenção e scripts

---

**Última Atualização:** 10/12/2025 - 04:15
**Status:** ✅ Configuração completa e validada
**Ambiente:** Produção
