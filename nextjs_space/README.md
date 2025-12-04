# RecruitAI - Plataforma de Recrutamento e Seleção

## 🚀 Sobre o Projeto

RecruitAI é uma plataforma completa de recrutamento e seleção com inteligência artificial, desenvolvida com Next.js 14 e tecnologias modernas.

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: NextAuth.js
- **Pagamentos**: Stripe
- **Armazenamento**: AWS S3
- **IA**: Abacus.AI / Google Gemini
- **Email**: Zoho Mail SMTP

## 📋 Pré-requisitos

- Node.js 18+ e Yarn
- Conta PostgreSQL (Supabase recomendado)
- Conta Stripe
- Bucket AWS S3
- Conta Zoho Mail ou similar para SMTP
- API Key Abacus.AI

## 🔧 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/recruitai.git

# Entre na pasta do projeto
cd recruitai/nextjs_space

# Instale as dependências
yarn install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Execute as migrações do banco
yarn prisma db push

# Popule o banco com dados iniciais
yarn tsx --require dotenv/config scripts/seed.ts

# Inicie o servidor de desenvolvimento
yarn dev
```

## 🌐 Deploy na Vercel

### Configuração Rápida

1. Faça push do código para o GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente (veja seção abaixo)
4. Deploy automático!

### Variáveis de Ambiente Necessárias

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://seu-dominio.vercel.app

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_REGION=us-east-2
AWS_S3_BUCKET_NAME=
AWS_S3_FOLDER_PREFIX=

# Abacus.AI
ABACUSAI_API_KEY=

# Email (SMTP)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=RecruitAI

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Teste
TEST_MODE_EMAIL=

# Manutenção
MAINTENANCE_SECRET=
```

## 📚 Documentação

- [Documentação Técnica](../DOCUMENTACAO_TECNICA.md)
- [Deploy Vercel](../DEPLOY_VERCEL.md)
- [Configuração AWS S3](../AWS_S3_CONFIG.md)
- [Setup Stripe](../STRIPE_SETUP.md)
- [API de Manutenção](../API_MANUTENCAO.md)

## 🔐 Segurança

- Nunca commite o arquivo `.env` no Git
- Use variáveis de ambiente para todas as credenciais
- Mantenha as dependências atualizadas
- Configure CORS adequadamente

## 👥 Usuários Padrão (após seed)

**Super Admin:**
- Email: admin@recruitai.com.br
- Senha: admin123

**Empresa Teste:**
- Email: empresa@teste.com
- Senha: empresa123

**Candidato Teste:**
- Email: candidato@teste.com
- Senha: candidato123

## 📝 Scripts Úteis

```bash
# Desenvolvimento
yarn dev              # Inicia servidor de desenvolvimento
yarn build            # Build de produção
yarn start            # Inicia servidor de produção

# Prisma
yarn prisma studio    # Interface visual do banco
yarn prisma generate  # Gera cliente Prisma
yarn prisma db push   # Aplica schema ao banco

# Scripts de manutenção
yarn tsx --require dotenv/config scripts/seed.ts                    # Popular banco
yarn tsx --require dotenv/config scripts/cleanup_orphans_db.ts      # Limpar dados órfãos
yarn tsx --require dotenv/config scripts/test-supabase-connection.ts # Testar conexão
```

## 🐛 Troubleshooting

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` está correto
- Confirme que o banco está acessível
- Execute `yarn prisma db push`

### Erro no Stripe
- Verifique as keys (test vs live)
- Configure o webhook endpoint
- Teste com `TEST_MODE_EMAIL`

### Erro no S3
- Confirme credenciais AWS
- Verifique permissões do bucket
- Execute `yarn tsx scripts/test-s3.ts`

## 📄 Licença

Este projeto é proprietário e confidencial.

## 📧 Suporte

Para suporte, entre em contato:
- Email: comercial@fcmtech.com.br
- Site: www.recruitai.com.br
