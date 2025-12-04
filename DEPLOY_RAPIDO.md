# 🚀 Deploy Rápido - RecruitAI

## ⚡ Guia Express (5 minutos)

### 💻 Passo 1: Enviar para GitHub

```bash
cd /home/ubuntu/ats_platform/nextjs_space

# Executar script automático
chmod +x push-to-github.sh
./push-to-github.sh
```

**Ou manualmente:**

```bash
# Inicializar Git
git init
git add .
git commit -m "Initial commit: RecruitAI"

# Conectar ao GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/recruitai.git
git branch -M main
git push -u origin main
```

---

### 🌐 Passo 2: Deploy na Vercel

1. Acesse: https://vercel.com/new
2. Clique em "Import" no repositório `recruitai`
3. **Root Directory**: `nextjs_space` ⭐
4. Clique em "Deploy"

---

### 🔐 Passo 3: Variáveis de Ambiente

Na Vercel, adicione estas variáveis:

#### Essenciais:
```env
DATABASE_URL=postgresql://postgres.jztrqlqrcgljpmxsbwfm:Fcm%402025@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_SECRET=[GERE UM TOKEN: https://generate-secret.vercel.app/32]
NEXTAUTH_URL=https://SEU_PROJETO.vercel.app
```

#### Stripe:
```env
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51SVzwvDtZaVksYfabty7tFEb0LZSCuTv0cFlpAonZ2kw7MIZtMpsPnQtWpuHfJgx36teTdjn7xobCOLeRMVQbAUV00ZO5vWGVw
STRIPE_WEBHOOK_SECRET=[Configure depois do deploy]
```

#### AWS S3:
```env
AWS_ACCESS_KEY_ID=AKIARJI3AIFWJPOTWNMN
AWS_SECRET_ACCESS_KEY=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
AWS_S3_REGION=us-east-2
AWS_S3_BUCKET_NAME=recruitai-resumes
AWS_S3_FOLDER_PREFIX=resumes/
```

#### Abacus.AI:
```env
ABACUSAI_API_KEY=5bb8032f287b4b89bfcae4529b50a199
```

#### Email (SMTP):
```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=comercial@fcmtech.com.br
SMTP_PASS=xG1PbdchhJYP
SMTP_FROM_NAME=RecruitAI
```

#### OAuth:
```env
GOOGLE_CLIENT_ID=763701288798-lbf0ro2ofmccinig1uvn8e4m5e8m2l90.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
LINKEDIN_CLIENT_ID=77xhqamin9d70o
LINKEDIN_CLIENT_SECRET=WPL_API1.ByV6rRjDiQblfTMR.ktymVw==
```

#### Outros:
```env
TEST_MODE_EMAIL=teste@fcmtech.com.br
MAINTENANCE_SECRET=[GERE OUTRO TOKEN]
```

---

### 🔧 Passo 4: Configurar Stripe Webhook

**APÓS o primeiro deploy:**

1. Acesse: https://dashboard.stripe.com/webhooks
2. Adicionar endpoint: `https://SEU_PROJETO.vercel.app/api/webhooks/stripe`
3. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.*`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copie o webhook secret (`whsec_...`)
5. Atualize `STRIPE_WEBHOOK_SECRET` na Vercel
6. **Redeploy** na Vercel

---

### 📊 Passo 5: Inicializar Banco

**Opção A - Localmente:**
```bash
cd nextjs_space
yarn prisma db push
yarn tsx --require dotenv/config scripts/seed.ts
```

**Opção B - API de Manutenção:**
```bash
# Aplicar schema
curl -X POST https://SEU_PROJETO.vercel.app/api/maintenance/execute \
  -H "Authorization: Bearer SEU_MAINTENANCE_SECRET" \
  -d '{"action": "prisma_push"}'

# Popular banco
curl -X POST https://SEU_PROJETO.vercel.app/api/maintenance/execute \
  -H "Authorization: Bearer SEU_MAINTENANCE_SECRET" \
  -d '{"action": "run_seed"}'
```

---

### ✅ Pronto!

Acesse: `https://SEU_PROJETO.vercel.app`

**Login Admin:**
- Email: `admin@recruitai.com.br`
- Senha: `admin123`

---

## 🌐 Domínio Personalizado (Opcional)

### Configurar www.recruitai.com.br:

1. Vercel → Settings → Domains → Add
2. Digite: `www.recruitai.com.br`
3. Configure DNS no Registro.br:

**Tipo CNAME:**
```
www.recruitai.com.br  →  cname.vercel-dns.com
```

4. Atualize `NEXTAUTH_URL`:
```env
NEXTAUTH_URL=https://www.recruitai.com.br
```

5. Redeploy

---

## 🔄 Atualizações

```bash
git add .
git commit -m "Atualização: descrição"
git push
```

Vercel fará deploy automático! 🎉

---

## 🐛 Problemas Comuns

### Build falhou
- Verifique se `Root Directory` = `nextjs_space`
- Confirme todas as env vars

### Erro de banco
- Verifique `DATABASE_URL`
- Execute `prisma db push`

### 404 em algumas páginas
- Execute `yarn build` localmente para testar
- Verifique logs na Vercel

---

## 📚 Links Úteis

- [Guia Completo](GITHUB_SETUP.md)
- [Documentação Técnica](DOCUMENTACAO_TECNICA.md)
- [API Manutenção](API_MANUTENCAO.md)
- [Vercel Docs](https://vercel.com/docs)
