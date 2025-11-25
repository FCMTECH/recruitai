# Sistema de Teste de Pagamento - RecruitAI

## 🎯 Objetivo

Permitir que o administrador da plataforma teste o fluxo completo de pagamento em produção **sem ser cobrado**, usando um email especial que ativa automaticamente qualquer plano sem passar pelo Stripe.

---

## ⚙️ Como Funciona

### 1. **Email de Teste Configurado**
```env
TEST_MODE_EMAIL=teste@fcmtech.com.br
```

### 2. **Detecção Automática**
Quando um usuário com este email tenta comprar um plano:
- ❌ **NÃO** é redirecionado para o Stripe
- ✅ **Cria** a assinatura diretamente no banco de dados
- 🔄 **Status**: Ativa imediatamente
- ⏱️ **Duração**: 30 dias

### 3. **Fluxo de Uso**

```
1. Criar conta com teste@fcmtech.com.br
   ↓
2. Ir para /pricing
   ↓
3. Selecionar QUALQUER plano
   ↓
4. Sistema detecta email de teste
   ↓
5. Cria subscription diretamente (SEM COBRANÇA)
   ↓
6. Redireciona para /dashboard
   ↓
7. Plano ativo por 30 dias!
```

---

## 💻 Implementação Técnica

### **API Endpoint**: `/api/checkout/test-mode`

```typescript
POST /api/checkout/test-mode
{
  "planId": "clxxx..."
}
```

**Validações:**
1. Usuário autenticado
2. Email = `TEST_MODE_EMAIL`
3. Plano existe e está ativo

**Ações:**
```typescript
// Cria ou atualiza subscription
Subscription {
  userId: session.user.id,
  planId: plan.id,
  status: 'active',        // ✅ Ativo imediatamente
  startDate: new Date(),
  endDate: +30 dias,
  jobsCreatedThisMonth: 0,
  stripeCustomerId: 'test_customer_{userId}',
  stripeSubscriptionId: 'test_sub_{timestamp}'
}
```

### **Modificação na Página de Pricing**

```typescript
// Detectar email de teste
const isTestEmail = sessionData?.user?.email === 'teste@fcmtech.com.br';

if (isTestEmail) {
  // Usar rota de teste
  fetch('/api/checkout/test-mode', {
    method: 'POST',
    body: JSON.stringify({ planId })
  });
} else {
  // Fluxo normal com Stripe
  fetch('/api/checkout/create-session', {
    method: 'POST',
    body: JSON.stringify({ planId })
  });
}
```

---

## 🛡️ Segurança

### **Proteções Implementadas:**

1. **Restrição de Email**
   - Apenas `teste@fcmtech.com.br` pode usar
   - Outros emails seguem fluxo normal de pagamento

2. **Validação no Backend**
   ```typescript
   const testModeEmail = process.env.TEST_MODE_EMAIL;
   if (session.user.email !== testModeEmail) {
     return 403; // Forbidden
   }
   ```

3. **Autenticação Obrigatória**
   - Requer sessão ativa do NextAuth
   - Verifica `userId` e `email`

4. **IDs Identificados**
   - `stripeCustomerId`: `test_customer_*`
   - `stripeSubscriptionId`: `test_sub_*`
   - Fácil identificar assinaturas de teste no banco

---

## 📝 Como Usar

### **Passo 1: Criar Conta de Teste**

```
Email: teste@fcmtech.com.br
Senha: (qualquer senha segura)
Tipo: Empresa
```

### **Passo 2: Acessar Página de Preços**

```
Navegar para: https://seu-dominio.com/pricing
```

### **Passo 3: Selecionar Plano**

```
✅ Bronze (R$ 149/mês)
✅ Prata (R$ 349/mês)
✅ Ouro (R$ 699/mês)
✅ Personalizado
```

**O que acontece:**
- 🚨 Sistema detecta email de teste
- ✅ Plano ativado INSTANTANEAMENTE
- 🎉 Toast: "Plano ativado em modo de teste! ✅"
- 🔄 Redirecionamento para `/dashboard`

### **Passo 4: Usar o Sistema Normalmente**

```
Acesso completo ao plano selecionado por 30 dias:
✅ Criar vagas
✅ Receber candidaturas
✅ Análise de IA
✅ Gerenciar equipe
✅ Todas as funcionalidades
```

---

## 🔍 Identificação de Assinaturas de Teste

### **Query SQL para Listar:**

```sql
SELECT 
  id,
  userId,
  planId,
  status,
  stripeCustomerId,
  stripeSubscriptionId,
  startDate,
  endDate
FROM "Subscription"
WHERE 
  stripeCustomerId LIKE 'test_customer_%'
  OR stripeSubscriptionId LIKE 'test_sub_%';
```

### **Deletar Assinaturas de Teste:**

```sql
DELETE FROM "Subscription"
WHERE 
  stripeCustomerId LIKE 'test_customer_%'
  OR stripeSubscriptionId LIKE 'test_sub_%';
```

---

## ⚠️ Importante

### **🚫 O Que NÃO Fazer:**

1. **Não usar em produção com clientes reais**
   - Este recurso é EXCLUSIVO para testes do administrador
   - Mantenha `TEST_MODE_EMAIL` secreto

2. **Não confiar apenas neste sistema**
   - Teste também com cartões de teste do Stripe em modo de teste
   - Valide o webhook em produção

3. **Não esquecer de renovar/deletar**
   - Assinaturas de teste expiram em 30 dias
   - Limpe periodicamente do banco de dados

### **✅ O Que Fazer:**

1. **Testar todos os planos**
   ```
   • Bronze
   • Prata
   • Ouro
   ```

2. **Validar limites**
   ```
   • Limite de vagas
   • Limite de membros da equipe
   • Recursos do plano
   ```

3. **Testar renovação**
   ```
   • Criar nova assinatura após expiração
   • Trocar de plano
   ```

---

## 📊 Monitoramento

### **Logs para Verificar:**

```bash
# Vercel Logs
"Test mode subscription created for user"
"Email de teste detectado: teste@fcmtech.com.br"

# Console do Browser
"Plano ativado em modo de teste! ✅"
```

### **Dashboard Admin:**
```
Ir para: /admin/subscriptions
Filtrar por: "Active"
Identificar: stripeCustomerId começa com "test_"
```

---

## 🔧 Troubleshooting

### **Problema: "Modo de teste não disponível"**

**Causa:** Email não é o configurado
**Solução:** Verificar `TEST_MODE_EMAIL` no `.env`

```bash
echo $TEST_MODE_EMAIL
# Deve retornar: teste@fcmtech.com.br
```

### **Problema: "Plano não ativado"**

**Causa:** Erro no banco de dados
**Solução:** Verificar logs do Prisma

```typescript
// Verificar conexão
npx prisma db push
```

### **Problema: "Subscription já existe"**

**Causa:** Já tem uma subscription ativa
**Solução:** Sistema atualiza automaticamente para o novo plano

---

## 🚀 Próximos Passos

### **Após Deploy:**

1. **Adicionar `TEST_MODE_EMAIL` no Vercel**
   ```
   Vercel Dashboard > Settings > Environment Variables
   Key: TEST_MODE_EMAIL
   Value: teste@fcmtech.com.br
   ```

2. **Criar conta de teste**
   ```
   Ir para: https://seu-app.vercel.app/auth/signup
   Cadastrar com: teste@fcmtech.com.br
   ```

3. **Testar cada plano**
   ```
   ✅ Ativar Bronze
   ✅ Mudar para Prata
   ✅ Mudar para Ouro
   ✅ Validar limites
   ```

4. **Documentar resultados**
   ```
   • Todos os planos funcionam?
   • Limites aplicados corretamente?
   • Dashboard funciona com cada plano?
   ```

---

## 📝 Resumo

| Aspecto | Valor |
|---------|-------|
| **Email de Teste** | `teste@fcmtech.com.br` |
| **Endpoint** | `/api/checkout/test-mode` |
| **Duração** | 30 dias |
| **Status** | Ativo imediatamente |
| **Custo** | R$ 0,00 (sem cobrança) |
| **Renovar** | Basta selecionar o plano novamente |
| **Segurança** | Restrito ao email configurado |

---

## ✔️ Checklist de Testes

```
☐ Criar conta com teste@fcmtech.com.br
☐ Acessar /pricing
☐ Testar plano Bronze
☐ Verificar limites (10 vagas, 4 membros)
☐ Criar vaga de teste
☐ Adicionar membro da equipe
☐ Mudar para plano Prata
☐ Verificar novos limites (60 vagas, 15 membros)
☐ Testar plano Ouro
☐ Verificar limites ilimitados
☐ Deletar assinatura de teste do banco
```

---

**✨ Sistema pronto para uso!**

Agora você pode testar a plataforma completa sem gastar nada, usando apenas o email `teste@fcmtech.com.br`. 🚀
