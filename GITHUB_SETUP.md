# 📦 Configuração do GitHub e Deploy na Vercel

## 🎯 Passo 1: Preparar o Projeto

### 1.1. Verificar Arquivos Criados

Os seguintes arquivos foram criados:
- ✅ `.gitignore` - Ignora arquivos sensíveis
- ✅ `README.md` - Documentação do projeto
- ✅ `.env.example` - Exemplo de variáveis de ambiente

### 1.2. Inicializar Git (se ainda não foi feito)

```bash
cd /home/ubuntu/ats_platform/nextjs_space

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Initial commit: RecruitAI Platform"
```

---

## 🌐 Passo 2: Criar Repositório no GitHub

### 2.1. Via GitHub Web (Recomendado)

1. Acesse: https://github.com/new
2. **Repository name**: `recruitai` (ou o nome que preferir)
3. **Visibility**: Escolha `Private` (recomendado) ou `Public`
4. **NÃO marque** "Add a README file"
5. **NÃO marque** "Add .gitignore"
6. Clique em **"Create repository"**

### 2.2. Conectar Repositório Local ao GitHub

Após criar o repositório, o GitHub mostrará comandos. Use:

```bash
# Adicionar remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/recruitai.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push para o GitHub
git push -u origin main
```

**Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub!**

---

## 🚀 Passo 3: Deploy na Vercel

### 3.1. Preparação

1. **Crie uma conta na Vercel**: https://vercel.com/signup
2. **Conecte sua conta do GitHub** à Vercel

### 3.2. Importar Projeto

1. Acesse o dashboard da Vercel: https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório **`recruitai`** do GitHub
4. Clique em **"Import"**

### 3.3. Configurações do Projeto

#### Framework Preset
- A Vercel detectará automaticamente **Next.js**

#### Root Directory
- Configure como: **`nextjs_space`** (muito importante!)

#### Build and Output Settings
- Deixe os padrões:
  - Build Command: `yarn build` ou `npm run build`
  - Output Directory: `.next`
  - Install Command: `yarn install` ou `npm install`

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

### 4.1. Na Interface da Vercel

Antes de fazer o deploy, clique em **"Environment Variables"** e adicione:

```env
# Database
DATABASE_URL=postgresql://postgres.jztrqlqrcgljpmxsbwfm:Fcm%402025@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# NextAuth
NEXTAUTH_SECRET=gere_uma_string_aleatoria_de_32_caracteres
NEXTAUTH_URL=https://SEU_DOMINIO.vercel.app

# Stripe
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51SVzwvDtZaVksYfabty7tFEb0LZSCuTv0cFlpAonZ2kw7MIZtMpsPnQtWpuHfJgx36teTdjn7xobCOLeRMVQbAUV00ZO5vWGVw
STRIPE_WEBHOOK_SECRET=whsec_SEU_NOVO_WEBHOOK_SECRET_DA_VERCEL

# AWS S3
AWS_ACCESS_KEY_ID=AKIARJI3AIFWJPOTWNMN
AWS_SECRET_ACCESS_KEY=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
AWS_S3_REGION=us-east-2
AWS_S3_BUCKET_NAME=recruitai-resumes
AWS_S3_FOLDER_PREFIX=resumes/

# Abacus.AI
ABACUSAI_API_KEY=5bb8032f287b4b89bfcae4529b50a199

# Email SMTP
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=comercial@fcmtech.com.br
SMTP_PASS=xG1PbdchhJYP
SMTP_FROM_NAME=RecruitAI

# OAuth - Google
GOOGLE_CLIENT_ID=763701288798-lbf0ro2ofmccinig1uvn8e4m5e8m2l90.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# OAuth - LinkedIn
LINKEDIN_CLIENT_ID=77xhqamin9d70o
LINKEDIN_CLIENT_SECRET=WPL_AP1.ByV6rRjDiQblfTMR.ktymVw==

# Teste
TEST_MODE_EMAIL=teste@fcmtech.com.br

# Manutenção
MAINTENANCE_SECRET=gere_um_token_aleatorio_para_manutencao
```

**IMPORTANTE:**
- Para `NEXTAUTH_SECRET`, gere uma string aleatória em: https://generate-secret.vercel.app/32
- Para `NEXTAUTH_URL`, use o domínio que a Vercel fornecerá (ex: `https://recruitai.vercel.app`)
- Para `MAINTENANCE_SECRET`, gere outro token aleatório

### 4.2. Configurar Stripe Webhook

Após o primeiro deploy:

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"**
3. **Endpoint URL**: `https://SEU_DOMINIO.vercel.app/api/webhooks/stripe`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copie o **Signing secret** (`whsec_...`)
6. Volte à Vercel → Environment Variables → Atualize `STRIPE_WEBHOOK_SECRET`
7. **Redeploy** o projeto na Vercel

---

## 📊 Passo 5: Configurar Banco de Dados (Primeira Vez)

### 5.1. Aplicar Schema do Prisma

Na sua máquina local ou no Vercel:

```bash
cd nextjs_space

# Aplicar schema ao banco de produção
yarn prisma db push

# Popular com dados iniciais
yarn tsx --require dotenv/config scripts/seed.ts
```

**OU** use a API de Manutenção (após deploy):

```bash
curl -X POST https://SEU_DOMINIO.vercel.app/api/maintenance/execute \
  -H "Authorization: Bearer SEU_MAINTENANCE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action": "prisma_push"}'

curl -X POST https://SEU_DOMINIO.vercel.app/api/maintenance/execute \
  -H "Authorization: Bearer SEU_MAINTENANCE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action": "run_seed"}'
```

---

## 🌐 Passo 6: Configurar Domínio Personalizado (Opcional)

### 6.1. Adicionar Domínio na Vercel

1. No projeto na Vercel, vá em **Settings** → **Domains**
2. Adicione: `www.recruitai.com.br`
3. A Vercel fornecerá registros DNS

### 6.2. Configurar DNS no Registro.br

**Tipo CNAME:**
```
www.recruitai.com.br  →  cname.vercel-dns.com
```

**Tipo A (se preferir):**
```
www.recruitai.com.br  →  76.76.21.21
```

### 6.3. Atualizar NEXTAUTH_URL

Após configurar o domínio:

1. Vercel → Settings → Environment Variables
2. Atualize `NEXTAUTH_URL` para: `https://www.recruitai.com.br`
3. Redeploy

---

## ✅ Passo 7: Verificação Final

### 7.1. Checklist

- [ ] Repositório GitHub criado e código enviado
- [ ] Projeto importado na Vercel
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Primeiro deploy concluído com sucesso
- [ ] Stripe webhook configurado
- [ ] Schema do banco aplicado (`prisma db push`)
- [ ] Dados iniciais populados (`seed.ts`)
- [ ] Domínio personalizado configurado (se aplicável)
- [ ] Login funciona (testar com usuário admin)
- [ ] Upload de arquivos funciona (testar S3)
- [ ] Pagamento funciona (testar modo teste do Stripe)

### 7.2. Testes Importantes

1. **Autenticação**:
   - Login: `admin@recruitai.com.br` / `admin123`
   - Criar novo usuário

2. **Upload de Currículos**:
   - Fazer upload de um PDF
   - Verificar se está no S3

3. **Pagamentos**:
   - Usar cartão de teste: `4242 4242 4242 4242`
   - Verificar webhook no Stripe Dashboard

4. **Email**:
   - Criar nova conta
   - Verificar se recebeu email de boas-vindas

---

## 🔄 Atualizações Futuras

### Quando Fizer Mudanças no Código:

```bash
# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição da mudança"

# Push para GitHub
git push origin main
```

**A Vercel fará deploy automático!** 🎉

### Se Mudar o Schema do Prisma:

```bash
# Aplicar mudanças
yarn prisma db push

# Regerar cliente Prisma
yarn prisma generate

# Commit e push
git add .
git commit -m "Update: Prisma schema"
git push origin main
```

---

## 🆘 Troubleshooting

### Erro: "Root directory is not found"
- Verifique se configurou `Root Directory` como `nextjs_space`

### Erro: "Module not found"
- Certifique-se que `node_modules` não está no Git (`.gitignore`)
- Vercel instalará automaticamente

### Erro: "Database connection failed"
- Verifique `DATABASE_URL` na Vercel
- Teste conexão localmente primeiro

### Erro: "NEXTAUTH_URL is not defined"
- Adicione `NEXTAUTH_URL` nas env vars da Vercel
- Formato: `https://seu-dominio.vercel.app`

---

## 📚 Documentação Adicional

- [Documentação Vercel](https://vercel.com/docs)
- [Deploy Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables na Vercel](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains na Vercel](https://vercel.com/docs/custom-domains)

---

## ✨ Status

🎉 **Projeto Pronto para Deploy!**

Todos os arquivos necessários foram criados. Siga os passos acima para fazer o deploy na Vercel.
