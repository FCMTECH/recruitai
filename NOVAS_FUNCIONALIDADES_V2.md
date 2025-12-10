# 🆕 NOVAS FUNCIONALIDADES - RecruitAI v2.0

## 📅 Data de Atualização: 26 de Novembro de 2025

---

## 🎯 Visão Geral das Atualizações

Esta versão 2.0 do RecruitAI traz funcionalidades críticas para empresas e administradores, focando em:
- ✅ **Suporte ao Cliente** - Sistema completo de tickets
- ✅ **Gestão de Equipe Avançada** - Convites e permissões granulares
- ✅ **Planos Personalizados** - Empresas com necessidades especiais
- ✅ **Recuperação de Senha** - Fluxo completo implementado
- ✅ **API de Manutenção** - Gestão remota do sistema
- ✅ **Melhorias de Performance** - Otimizações críticas

---

## 1. 🎫 SISTEMA DE SUPORTE

### Visão Geral
Sistema completo de tickets de suporte com comunicação bidirecional entre empresas e superadmins.

### Funcionalidades

#### Para Empresas (`/dashboard/support`)
- ✅ Criar tickets com assunto, mensagem e prioridade
- ✅ Acompanhar status (aberto, em progresso, aguardando empresa, fechado)
- ✅ Adicionar mensagens aos tickets existentes
- ✅ Receber notificações quando admin responde
- ✅ Filtrar tickets por status

#### Para Superadmins (`/admin/support`)
- ✅ Ver todos os tickets de todas as empresas
- ✅ Filtrar por status e pesquisar
- ✅ Responder tickets (marcado automaticamente como admin)
- ✅ Alterar status e prioridade
- ✅ Fechar tickets
- ✅ Receber notificações de novos tickets

### APIs Disponíveis

```typescript
// Criar ticket
POST /api/support
{
  "subject": "Problema com upload",
  "message": "Não consigo fazer upload de currículos",
  "priority": "high"
}

// Listar tickets
GET /api/support?status=open

// Ver detalhes de um ticket
GET /api/support/[id]

// Adicionar mensagem
POST /api/support/[id]
{ "message": "Tentei novamente mas continua o erro" }

// Atualizar status/prioridade
PATCH /api/support/[id]
{ "status": "in_progress", "priority": "high" }
```

### Notificações Automáticas
- 🔔 Admin recebe notificação ao criar novo ticket
- 🔔 Empresa recebe notificação quando admin responde
- 🔔 Admin recebe notificação quando empresa responde

---

## 2. 👥 SISTEMA DE CONVITES DE MEMBROS

### Visão Geral
Permite que empresas convidem membros da equipe por email, com validações automáticas de segurança.

### Validações Implementadas

✅ **Domínio de Email**
- Membro deve ter email do mesmo domínio da empresa
- Exemplo: Se empresa é `@empresa.com`, membros devem ser `@empresa.com`

✅ **Limite de Membros**
- Respeita limite do plano (Bronze: 4, Prata: 15, Ouro: 30)
- Bloqueia convite se limite for atingido

✅ **Duplicidade**
- Não permite convidar email já existente
- Não permite convite duplicado pendente

### Fluxo de Convite

#### Passo 1: Empresa Convida
```typescript
POST /api/member-invitations
{
  "email": "joao@empresa.com",
  "name": "João Silva",
  "groupId": "group_123",      // Opcional
  "permissionId": "perm_456"   // Opcional
}
```

**Resultado:**
- Token único gerado
- Validade de 7 dias
- Email enviado automaticamente

#### Passo 2: Membro Recebe Email
- Link para `/member-invite/[token]`
- Detalhes da empresa
- Formulário de criação de senha

#### Passo 3: Membro Aceita
```typescript
POST /api/member-invitations/[token]
{
  "password": "senha123",
  "confirmPassword": "senha123"
}
```

**Resultado:**
- Conta `CompanyUser` criada
- Convite marcado como aceito
- Notificação enviada para empresa
- Redirecionamento para login

---

## 3. 🏢 PLANOS PERSONALIZADOS PARA EMPRESAS

### Visão Geral
Permite que superadmins criem planos totalmente customizados para empresas específicas.

### Características
- 💰 Preço personalizado
- 📊 Limite de vagas customizado
- 👥 Membros customizados (ou ilimitados)
- 🎨 Features exclusivas
- 💳 Integração completa com Stripe

### Fluxo Completo

#### Passo 1: Admin Cria Convite (`/admin/custom-companies`)

```typescript
POST /api/admin/companies/create-with-custom-plan
{
  "email": "empresa@exemplo.com",
  "companyName": "Empresa XYZ Ltda",
  "tradeName": "XYZ Tech",
  "cnpj": "12345678000190",
  "phone": "+5511999999999",
  
  "customJobLimit": 150,
  "customPrice": 1200.00,
  "customFeatures": [
    "150 vagas por mês",
    "Membros ilimitados",
    "Suporte prioritário 24/7",
    "API dedicada",
    "White label"
  ],
  
  "notes": "Cliente VIP - atender com prioridade"
}
```

**Resultado:**
- Cria `CompanyInvitation`
- Envia email elegante para empresa
- Token válido por 7 dias

#### Passo 2: Empresa Configura (`/company-setup/[token]`)

**2.1 - Criar Senha:**
- Formulário simples
- Validação de senha
- Cria usuário no banco

**2.2 - Realizar Pagamento:**
- Checkout Stripe customizado
- Mostra detalhes do plano personalizado
- Aceita cartão e boleto

#### Passo 3: Webhook Stripe Processa

**Ações Automáticas:**
1. Cria novo `Plan` no banco com dados customizados
2. Marca como `isCustom: true`
3. Vincula à empresa (`customCompanyId`)
4. Cria `Subscription` ativa
5. Atualiza convite para `completed`
6. Envia email de confirmação

**Resultado Final:**
- ✅ Empresa com conta ativa
- ✅ Plano exclusivo criado
- ✅ Assinatura por 30 dias
- ✅ Acesso liberado

### Gestão de Convites

**Ver Todos:**
```typescript
GET /api/admin/company-invitations?status=pending
```

**Atualizar:**
```typescript
PATCH /api/admin/company-invitations/[id]
{
  "notes": "Cliente confirmou pagamento",
  "status": "completed"
}
```

---

## 4. 🔑 RECUPERAÇÃO DE SENHA

### Fluxo Implementado

#### Passo 1: Solicitar Recuperação (`/auth/forgot-password`)

```typescript
POST /api/auth/forgot-password
{ "email": "usuario@exemplo.com" }
```

**Ação:**
- Gera token único
- Validade de 1 hora
- Envia email com link
- Retorna sempre sucesso (anti-enumeração)

#### Passo 2: Redefinir Senha (`/auth/reset-password`)

```typescript
POST /api/auth/reset-password
{
  "token": "abc123...",
  "password": "novaSenha123",
  "confirmPassword": "novaSenha123"
}
```

**Validações:**
- ✅ Token válido e não expirado
- ✅ Senhas idênticas
- ✅ Senha mínima de 6 caracteres

**Ação:**
- Hash da nova senha (bcrypt)
- Atualiza no banco
- Invalida token
- Sucesso → redireciona para login

---

## 5. 🔧 API DE MANUTENÇÃO REMOTA

### Visão Geral
Permite manutenção completa do sistema sem acesso SSH.

**Documentação Completa:** Ver `API_MANUTENCAO.md`

### Recursos

#### 1. Status do Sistema
```bash
GET /api/maintenance/status
```
Retorna: banco, servidor, memória, estatísticas

#### 2. Executar Ações
```bash
POST /api/maintenance/execute
{
  "action": "restart_server" | "clear_cache" | 
            "prisma_generate" | "prisma_push" |
            "run_seed" | "cleanup_orphans" | "get_logs"
}
```

#### 3. Histórico
```bash
GET /api/maintenance/logs?limit=50&status=success
```

### Ações Disponíveis

| Ação | Descrição |
|------|----------|
| `restart_server` | Reinicia Next.js |
| `clear_cache` | Limpa cache |
| `check_database` | Verifica banco |
| `prisma_generate` | Gera Prisma Client |
| `prisma_push` | Aplica schema |
| `run_seed` | Popula banco |
| `cleanup_orphans` | Remove órfãos |
| `get_logs` | Obtém logs |

### Autenticação

Todas as requisições exigem:
```bash
Authorization: Bearer <MAINTENANCE_SECRET>
```

**Token Atual:**
```
3977aa7046e9bf25ce7e91d535177b4c00794ec8fd29b98b5fc5a2697a455c1e
```

---

## 6. ⚡ MELHORIAS DE PERFORMANCE

### Otimizações Implementadas

#### 1. Polling Otimizado
**Antes:** 30 segundos
**Depois:** 2 minutos (120 segundos)

**Componentes Afetados:**
- `NotificationBell` - Notificações in-app
- `AdminHeader` - Contagem de planos personalizados

**Impacto:**
- ⬇️ 75% menos requisições ao servidor
- ⚡ Redução significativa de carga
- 💰 Economia de recursos

#### 2. Emails Assíncronos

**Implementação:**
```typescript
// Antes (bloqueante)
await sendEmail({...});
return NextResponse.json({...});

// Depois (não-bloqueante)
setImmediate(async () => {
  await sendEmail({...});
});
return NextResponse.json({...}); // Retorno imediato
```

**Impacto:**
- ⚡ Resposta instantânea de APIs
- 🚀 Melhor experiência do usuário
- 🔄 Emails enviados em background

#### 3. Timeouts Configurados

**Formulário de Plano Personalizado:**
- Timeout de 15 segundos
- Mensagens de erro específicas
- Fallback para problemas de conexão

**Impacto:**
- ✅ Usuário não fica esperando indefinidamente
- 📊 Melhor feedback de erros
- 🔍 Facilita debugging

---

## 7. 💌 SISTEMA DE EMAILS EXPANDIDO

### Novos Templates

1. **Password Reset** - Recuperação de senha
2. **Member Invitation** - Convite de membro
3. **Company Invitation** - Convite de empresa (plano personalizado)
4. **Support Ticket Created** - Novo ticket criado
5. **Support Ticket Reply** - Resposta de ticket
6. **Welcome Email (Company)** - Boas-vindas empresa
7. **Welcome Email (Candidate)** - Boas-vindas candidato

### Configuração SMTP

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=noreply@fcmtech.com.br
SMTP_PASS=<senha>
SMTP_FROM_NAME=RecruitAI
```

---

## 8. 🗄️ NOVOS MODELOS DE DADOS

### Entidades Adicionadas

1. **SupportTicket** - Tickets de suporte
2. **SupportMessage** - Mensagens de tickets
3. **MemberInvitation** - Convites de membros
4. **CompanyInvitation** - Convites de empresas
5. **MaintenanceLog** - Logs de manutenção
6. **PasswordResetToken** - Tokens de recuperação
7. **CustomPlanRequest** - Solicitações de plano personalizado

### Campos Adicionados

**User:**
- `tradeName` - Nome fantasia
- `cnpj` - CNPJ da empresa
- `phone` - Telefone
- `address` - Endereço
- `city` - Cidade
- `state` - Estado

**Plan:**
- `isCustom` - Marca planos personalizados
- `customCompanyId` - ID da empresa dona

**Subscription:**
- `gracePeriodEndDate` - Fim do período de graça
- `gracePeriodDays` - Dias de graça concedidos
- `suspensionReason` - Motivo de suspensão

---

## 9. 🔐 SEGURANÇA APRIMORADA

### Validações Implementadas

#### Domínio de Email
```typescript
const companyDomain = companyUser.email.split('@')[1];
const memberDomain = newEmail.split('@')[1];
if (companyDomain !== memberDomain) {
  throw new Error('Domínio inválido');
}
```

#### Tokens Únicos
- Geração com `crypto.randomBytes(32)`
- Validade temporal (1h para senha, 7 dias para convites)
- Invalidação após uso

#### Rate Limiting
- API de manutenção protegida por token secreto
- Logs de auditoria de todas as ações

---

## 10. 📊 NOVAS PÁGINAS E ROTAS

### Para Empresas
- `/dashboard/support` - Central de suporte
- `/member-invite/[token]` - Aceitar convite de membro
- `/dashboard/permissions` - Gerenciar permissões

### Para Superadmins
- `/admin/support` - Gerenciar todos os tickets
- `/admin/custom-companies` - Criar empresas personalizadas
- `/admin/admins` - Gerenciar administradores

### Para Empresas Convidadas
- `/company-setup/[token]` - Configurar conta
- `/company-setup/[token]/success` - Sucesso do pagamento

### Para Todos
- `/auth/forgot-password` - Solicitar recuperação
- `/auth/reset-password` - Redefinir senha

---

## 11. 🎨 MELHORIAS DE UI/UX

### Componentes Novos
- `InterviewActions` - Ações de entrevista
- `NotificationBell` - Sino de notificações (otimizado)
- Formulários de suporte estilizados
- Cards de convites elegantes

### Feedback do Usuário
- ✅ Toasts informativos (sonner)
- ✅ Estados de loading consistentes
- ✅ Mensagens de erro específicas
- ✅ Confirmações para ações destrutivas

---

## 12. 📝 SCRIPTS ADICIONADOS

### Novos Scripts de Manutenção

```bash
# Criar tabela de suporte
yarn tsx scripts/create_support_tables.ts

# Criar tabela de convites de empresas
yarn tsx scripts/create_company_invitation_table.ts

# Verificar tabela de planos personalizados
yarn tsx scripts/check_custom_plan_table.ts

# Criar tabela de logs de manutenção
yarn tsx scripts/create_maintenance_log_table.ts

# Testar conexão S3
yarn tsx scripts/test-s3.ts

# Testar conexão Supabase
yarn tsx scripts/test-supabase-connection.ts
```

---

## 13. 🚀 VARIÁVEIS DE AMBIENTE ADICIONADAS

### Obrigatórias

```env
# Email
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=noreply@fcmtech.com.br
SMTP_PASS=<senha>
SMTP_FROM_NAME=RecruitAI

# Manutenção
MAINTENANCE_SECRET=<token_gerado>
```

### Opcionais

```env
# Teste
TEST_MODE_EMAIL=teste@fcmtech.com.br

# S3 Alternativas
AWS_S3_REGION=us-west-2
AWS_S3_BUCKET_NAME=meu-bucket
AWS_S3_FOLDER_PREFIX=uploads/
```

---

## 14. 📚 DOCUMENTAÇÃO ATUALIZADA

### Arquivos Atualizados
- ✅ `DOCUMENTACAO_TECNICA.md` - Documentação completa
- ✅ `DEPLOY_VERCEL.md` - Guia de deploy
- ✅ `API_MANUTENCAO.md` - API de manutenção
- ✅ `AWS_S3_CONFIG.md` - Configuração S3
- ✅ `CAPACIDADE_SISTEMA.md` - Capacidade do sistema

### Arquivos Novos
- ✅ `NOVAS_FUNCIONALIDADES_V2.md` - Este arquivo

---

## 15. ✅ CHECKLIST DE ATUALIZAÇÃO

### Backend
- [x] Sistema de suporte completo
- [x] Convites de membros com validações
- [x] Planos personalizados end-to-end
- [x] Recuperação de senha
- [x] API de manutenção
- [x] Emails assíncronos
- [x] Polling otimizado
- [x] Novos modelos no Prisma

### Frontend
- [x] Páginas de suporte (empresa e admin)
- [x] Página de convite de membro
- [x] Páginas de setup de empresa
- [x] Páginas de recuperação de senha
- [x] UI para planos personalizados
- [x] Notificações otimizadas

### Infraestrutura
- [x] SMTP configurado (Zoho)
- [x] AWS S3 funcional
- [x] Stripe webhooks atualizados
- [x] Variáveis de ambiente documentadas

### Documentação
- [x] Documentação técnica atualizada
- [x] Guia de deploy atualizado
- [x] API de manutenção documentada
- [x] Novas funcionalidades documentadas

---

## 16. 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Para Deploy
1. ✅ Adicionar todas as variáveis de ambiente na Vercel
2. ✅ Configurar SMTP (Zoho ou outro)
3. ✅ Testar API de manutenção
4. ✅ Verificar webhooks do Stripe
5. ✅ Rodar `prisma db push` em produção

### Para Testes
1. 🧪 Criar ticket de suporte
2. 🧪 Convidar membro de equipe
3. 🧪 Criar empresa com plano personalizado
4. 🧪 Testar recuperação de senha
5. 🧪 Validar emails recebidos
6. 🧪 Verificar notificações in-app

### Para Monitoramento
1. 📊 Configurar alertas na Vercel
2. 📊 Monitorar logs de manutenção
3. 📊 Acompanhar taxa de envio de emails
4. 📊 Verificar performance (polling)

---

## 📞 SUPORTE

**Problemas ou Dúvidas:**
1. Verificar `DOCUMENTACAO_TECNICA.md`
2. Consultar `API_MANUTENCAO.md`
3. Usar API de manutenção para diagnóstico
4. Verificar logs: `GET /api/maintenance/logs`

**Equipe de Desenvolvimento:**
- DeepAgent (Abacus.AI)
- Data: 26 de Novembro de 2025

---

**FIM DAS NOVAS FUNCIONALIDADES V2.0**
