
# 📘 Guia Completo: Subir Projeto para o GitHub

Este guia detalha **passo a passo** como colocar seu projeto RecruitAI no GitHub.

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub ([criar aqui](https://github.com/signup))
- ✅ Git instalado no seu computador ([baixar aqui](https://git-scm.com/downloads))

---

## 🚀 Passo 1: Criar Repositório no GitHub

### 1.1 Acessar GitHub
1. Acesse [github.com](https://github.com)
2. Faça login na sua conta

### 1.2 Criar Novo Repositório
1. Clique no botão **"+"** no canto superior direito
2. Selecione **"New repository"**

### 1.3 Configurar Repositório
```
Nome do repositório: recruit-ai-platform
Descrição (opcional): Plataforma ATS completa para Recrutamento e Seleção
Visibilidade: 
  ⚪ Public (qualquer pessoa pode ver)
  🔘 Private (apenas você e colaboradores podem ver) ← RECOMENDADO
```

**⚠️ IMPORTANTE:**
- ❌ **NÃO** marque "Add a README file"
- ❌ **NÃO** adicione .gitignore
- ❌ **NÃO** escolha uma licença agora

4. Clique em **"Create repository"**

---

## 📝 Passo 2: Preparar o Projeto Localmente

### 2.1 Criar arquivo .gitignore

Este arquivo diz ao Git quais arquivos **NÃO** enviar para o GitHub (arquivos sensíveis, dependências, etc).

```bash
cd /home/ubuntu/ats_platform/nextjs_space
```

Crie o arquivo `.gitignore`:

```bash
cat > .gitignore << 'EOF'
# Dependências
node_modules/
.pnp
.pnp.js

# Testes
coverage/
.nyc_output

# Build do Next.js
.next/
out/
build/
dist/
.build/

# Cache
.cache/
.parcel-cache/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Variáveis de Ambiente (MUITO IMPORTANTE!)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Arquivos do sistema
.DS_Store
Thumbs.db
*.swp
*.swo
*~

# IDEs
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# TypeScript
*.tsbuildinfo
next-env.d.ts

# PWA
**/public/sw.js
**/public/workbox-*.js
**/public/worker-*.js
**/public/fallback-*.js

# Arquivos temporários
tmp/
temp/
.tmp/

# Prisma
prisma/migrations/**/migration.sql
!prisma/migrations/migration_lock.toml

# Uploads locais (se houver)
uploads/
public/uploads/

# Vercel
.vercel

# Turbopack
.turbo/
EOF
```

### 2.2 Criar README.md

```bash
cat > README.md << 'EOF'
# 🚀 RecruitAI - Plataforma ATS Completa

Sistema completo de Recrutamento e Seleção com IA, desenvolvido com Next.js 14, React, PostgreSQL e AWS.

## 📌 Funcionalidades Principais

### Para Empresas
- ✅ Gestão completa de vagas
- ✅ Análise de currículos com IA (Gemini)
- ✅ Sistema de permissões granulares
- ✅ Organização por grupos de equipe
- ✅ Dashboard com métricas e filtros
- ✅ Agenda e tarefas integradas
- ✅ Múltiplos planos de assinatura

### Para Candidatos
- ✅ Perfil completo com currículo
- ✅ Busca de vagas com match de IA
- ✅ Candidatura simplificada
- ✅ Acompanhamento de status

### Para Administradores
- ✅ Painel de controle global
- ✅ Gestão de empresas e assinaturas
- ✅ Controle de períodos de graça
- ✅ Múltiplos administradores

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Shadcn/ui
- **Backend:** Next.js API Routes, Node.js
- **Banco de Dados:** PostgreSQL + Prisma ORM
- **Autenticação:** NextAuth.js (Credentials, Google, LinkedIn)
- **Pagamentos:** Stripe (Card, PIX, Boleto)
- **Armazenamento:** AWS S3
- **IA:** Abacus.AI + Google Gemini
- **Email:** Sistema de notificações configurável

## 📦 Estrutura do Projeto

```
nextjs_space/
├── app/                  # Páginas e rotas (App Router)
│   ├── admin/           # Painel administrativo
│   ├── api/             # API Routes
│   ├── auth/            # Autenticação
│   ├── candidate/       # Dashboard do candidato
│   ├── dashboard/       # Dashboard da empresa
│   └── ...
├── components/          # Componentes React
│   ├── ui/              # Componentes de UI (Shadcn)
│   └── ...
├── lib/                 # Utilitários e configurações
├── prisma/              # Schema e migrações
├── public/              # Arquivos estáticos
└── scripts/             # Scripts de manutenção
```

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ e Yarn
- PostgreSQL
- Conta AWS (S3)
- Conta Stripe

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/recruit-ai-platform.git
cd recruit-ai-platform/nextjs_space
```

2. Instale as dependências:
```bash
yarn install
```

3. Configure as variáveis de ambiente (veja `.env.example`)

4. Execute as migrações do banco:
```bash
yarn prisma db push
yarn tsx scripts/seed.ts
```

5. Inicie o servidor de desenvolvimento:
```bash
yarn dev
```

6. Acesse: `http://localhost:3000`

## 🔐 Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
# Banco de Dados
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."

# Abacus.AI
ABACUSAI_API_KEY="..."
```

## 📚 Documentação

- [Documentação Técnica Completa](DOCUMENTACAO_TECNICA.md)
- [Guia de Deploy na Vercel](DEPLOY_VERCEL.md)
- [Guia de Deploy na AWS](AWS_DEPLOY.md)
- [Configuração do Stripe](STRIPE_SETUP.md)

## 🔑 Credenciais de Teste

### Empresa
- Email: `john@doe.com`
- Senha: `johndoe123`

### Candidato
- Email: `jane@doe.com`
- Senha: `janedoe123`

### Admin
- Email: `admin@atsplatform.com`
- Senha: `admin123`

## 📊 Planos de Assinatura

| Plano | Preço | Vagas/mês | Membros | Recursos |
|-------|-------|-----------|---------|----------|
| **Bronze** | R$ 199 | 5 | 4 | Básico + IA |
| **Prata** | R$ 499 | 20 | 15 | Bronze + Permissões |
| **Ouro** | R$ 999 | 50 | 30 | Prata + Suporte |
| **Personalizado** | Sob consulta | Ilimitado | Customizável | Tudo + Custom |

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvido por

**RecruitAI Team**

---

⭐ Se este projeto ajudou você, considere dar uma estrela!
EOF
```

### 2.3 Criar arquivo .env.example

Este arquivo serve como **modelo** para outras pessoas (ou você em outro ambiente) saberem quais variáveis configurar:

```bash
cat > .env.example << 'EOF'
# ===================================
# BANCO DE DADOS
# ===================================
DATABASE_URL="postgresql://usuario:senha@host:5432/nome_banco"

# ===================================
# NEXTAUTH (Autenticação)
# ===================================
NEXTAUTH_SECRET="cole_aqui_secret_gerado_com_openssl_rand_base64_32"
NEXTAUTH_URL="http://localhost:3000"

# ===================================
# STRIPE (Pagamentos)
# ===================================
STRIPE_SECRET_KEY="sk_test_seu_secret_key_aqui"
STRIPE_PUBLISHABLE_KEY="pk_test_sua_publishable_key_aqui"
STRIPE_WEBHOOK_SECRET="whsec_seu_webhook_secret_aqui"

# ===================================
# AWS S3 (Armazenamento de Arquivos)
# ===================================
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="seu-bucket-name"
AWS_FOLDER_PREFIX="ats-platform/"
AWS_ACCESS_KEY_ID="sua_access_key_id"
AWS_SECRET_ACCESS_KEY="sua_secret_access_key"

# ===================================
# GOOGLE OAUTH (Login com Google)
# ===================================
GOOGLE_CLIENT_ID="seu-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"

# ===================================
# LINKEDIN OAUTH (Login com LinkedIn)
# ===================================
LINKEDIN_CLIENT_ID="seu-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="seu-linkedin-client-secret"

# ===================================
# ABACUS.AI (IA para Análise de Currículos)
# ===================================
ABACUSAI_API_KEY="sua-api-key-abacus-ai"

# ===================================
# CRON SECRET (Para tarefas agendadas)
# ===================================
CRON_SECRET="seu-cron-secret-gerado-com-openssl-rand_hex_32"

# ===================================
# SMTP (Email - Opcional)
# ===================================
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="seu-email@gmail.com"
# SMTP_PASS="sua-senha-app-gmail"
# SMTP_FROM="RecruitAI <noreply@recruitai.com>"
EOF
```

---

## 🔧 Passo 3: Inicializar Git no Projeto

### 3.1 Navegar até a pasta do projeto

```bash
cd /home/ubuntu/ats_platform
```

### 3.2 Inicializar repositório Git

```bash
git init
```

**Saída esperada:**
```
Initialized empty Git repository in /home/ubuntu/ats_platform/.git/
```

### 3.3 Configurar usuário Git (se ainda não fez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

**⚠️ Use o mesmo email da sua conta do GitHub!**

---

## 📤 Passo 4: Fazer o Primeiro Commit

### 4.1 Adicionar todos os arquivos

```bash
git add .
```

Este comando adiciona **todos os arquivos** do projeto, exceto os que estão no `.gitignore`.

### 4.2 Fazer o commit

```bash
git commit -m "Initial commit: RecruitAI Platform v1.0"
```

**Saída esperada:**
```
[master (root-commit) abc1234] Initial commit: RecruitAI Platform v1.0
 XXX files changed, XXXXX insertions(+)
 create mode 100644 ...
 ...
```

---

## 🌐 Passo 5: Conectar ao GitHub e Fazer Push

### 5.1 Adicionar repositório remoto

Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub:

```bash
git remote add origin https://github.com/SEU_USUARIO/recruit-ai-platform.git
```

**Exemplo:**
```bash
git remote add origin https://github.com/joaosilva/recruit-ai-platform.git
```

### 5.2 Renomear branch para main (padrão moderno)

```bash
git branch -M main
```

### 5.3 Fazer push para o GitHub

```bash
git push -u origin main
```

**O que acontecerá:**
1. Git pedirá suas credenciais do GitHub
2. Todos os arquivos serão enviados para o repositório
3. Sua branch `main` será criada no GitHub

**Saída esperada:**
```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
...
To https://github.com/SEU_USUARIO/recruit-ai-platform.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## ✅ Verificar Upload

1. Acesse: `https://github.com/SEU_USUARIO/recruit-ai-platform`
2. Você deverá ver todos os arquivos do projeto
3. ⚠️ **Verifique se o arquivo `.env` NÃO está lá** (por segurança!)

---

## 🔐 Passo 6: Configurar Secrets no GitHub (Opcional mas Recomendado)

Se você for usar GitHub Actions (CI/CD), configure as secrets:

### 6.1 Acessar Settings do Repositório

1. No seu repositório, clique em **"Settings"**
2. No menu lateral, clique em **"Secrets and variables"** > **"Actions"**

### 6.2 Adicionar Secrets

Clique em **"New repository secret"** e adicione uma por uma:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `postgresql://usuario:senha@host:5432/banco` |
| `NEXTAUTH_SECRET` | Seu secret gerado |
| `STRIPE_SECRET_KEY` | `sk_live_...` ou `sk_test_...` |
| `AWS_ACCESS_KEY_ID` | Sua Access Key da AWS |
| `AWS_SECRET_ACCESS_KEY` | Sua Secret Key da AWS |
| `ABACUSAI_API_KEY` | Sua API Key da Abacus.AI |

**⚠️ IMPORTANTE:**
- **NUNCA** commite o arquivo `.env` com dados reais
- Use secrets do GitHub para CI/CD
- Para produção, use variáveis de ambiente da plataforma de deploy

---

## 🔄 Passo 7: Comandos Git para Uso Futuro

### Verificar status dos arquivos

```bash
git status
```

### Adicionar arquivos modificados

```bash
# Adicionar arquivo específico
git add caminho/do/arquivo.ts

# Adicionar todos os arquivos modificados
git add .
```

### Fazer commit

```bash
git commit -m "Descrição clara do que foi feito"
```

**Exemplos de boas mensagens:**
```bash
git commit -m "Fix: Corrige bug na validação de email"
git commit -m "Add: Adiciona campo de telefone no cadastro"
git commit -m "Update: Melhora performance do dashboard"
git commit -m "Remove: Remove código não utilizado"
```

### Enviar para o GitHub

```bash
git push origin main
```

### Puxar atualizações do GitHub

```bash
git pull origin main
```

### Ver histórico de commits

```bash
git log --oneline
```

### Criar uma nova branch

```bash
git checkout -b feature/nova-funcionalidade
```

### Voltar para a branch main

```bash
git checkout main
```

### Mesclar uma branch na main

```bash
git checkout main
git merge feature/nova-funcionalidade
```

---

## 🚨 Solução de Problemas Comuns

### Erro: "remote: Repository not found"
**Causa:** URL do repositório está errada ou você não tem permissão.
**Solução:**
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO_CORRETO/recruit-ai-platform.git
```

### Erro: "failed to push some refs"
**Causa:** Há mudanças no GitHub que não estão no seu local.
**Solução:**
```bash
git pull origin main --rebase
git push origin main
```

### Erro: "fatal: not a git repository"
**Causa:** Você não está na pasta correta ou não executou `git init`.
**Solução:**
```bash
cd /home/ubuntu/ats_platform
git init
```

### Arquivo .env foi enviado por engano
**⚠️ ATENÇÃO: Se isso acontecer, siga estes passos IMEDIATAMENTE:**

1. **Remover o arquivo do Git:**
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
git push origin main
```

2. **MUDAR TODAS AS CREDENCIAIS** que estavam no .env:
   - Gerar novo `NEXTAUTH_SECRET`
   - Regenerar chaves do Stripe
   - Criar novas credenciais AWS
   - Etc.

3. **Adicionar .env ao .gitignore:**
```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push origin main
```

---

## 📚 Próximos Passos

Agora que seu projeto está no GitHub:

1. ✅ **Clone em outro ambiente** para testar
2. ✅ **Configure CI/CD** com GitHub Actions (opcional)
3. ✅ **Adicione badges** ao README (build status, coverage)
4. ✅ **Convide colaboradores** (Settings > Collaborators)
5. ✅ **Configure branch protection** (Settings > Branches)

---

## 🎯 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] .gitignore configurado corretamente
- [ ] README.md criado
- [ ] .env.example criado
- [ ] Arquivo .env NÃO está no repositório
- [ ] Git inicializado no projeto
- [ ] Primeiro commit feito
- [ ] Repositório remoto adicionado
- [ ] Push para o GitHub concluído
- [ ] Código visível no github.com/seu-usuario/recruit-ai-platform
- [ ] Secrets configuradas (se necessário)

---

## 🎉 Parabéns!

Seu projeto agora está no GitHub e pronto para ser compartilhado ou fazer deploy! 🚀

**Próximo passo:** Veja o guia `AWS_DEPLOY.md` para fazer o deploy na AWS.
EOF
