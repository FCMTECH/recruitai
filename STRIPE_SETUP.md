
# Configuração do Stripe para Pagamentos

## 1. Criar Conta no Stripe

1. Acesse [https://stripe.com](https://stripe.com)
2. Clique em "Sign Up" e crie sua conta
3. Complete o processo de verificação

## 2. Obter as Chaves da API

1. Acesse o Dashboard do Stripe: [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
2. No menu lateral, clique em "Developers" → "API keys"
3. Você verá duas chaves:
   - **Publishable key** (pk_test_... ou pk_live_...)
   - **Secret key** (sk_test_... ou sk_live_...)

### Modo de Teste vs. Produção

- **Modo de Teste**: Use as chaves que começam com `pk_test_` e `sk_test_`
  - Não processa pagamentos reais
  - Ideal para desenvolvimento e testes
  
- **Modo de Produção**: Use as chaves que começam com `pk_live_` e `sk_live_`
  - Processa pagamentos reais
  - Requer ativação da conta

## 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env` e adicione suas chaves:

```bash
# Use as chaves de TESTE durante o desenvolvimento
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
```

## 4. Configurar Webhook

Os webhooks permitem que o Stripe notifique sua aplicação sobre eventos de pagamento.

### Durante o Desenvolvimento (Local)

1. Instale o Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. Faça login no Stripe CLI:
   ```bash
   stripe login
   ```

3. Encaminhe os webhooks para seu servidor local:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

4. O CLI mostrará um webhook secret (whsec_...). Adicione no `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
   ```

### Em Produção

1. No Dashboard do Stripe, vá em "Developers" → "Webhooks"
2. Clique em "Add endpoint"
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/webhooks/stripe`
   - **Events to send**: Selecione os seguintes eventos:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

4. Copie o "Signing secret" (whsec_...) e adicione no `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_de_producao
   ```

## 5. Métodos de Pagamento Disponíveis

A plataforma está configurada para aceitar:

- **Cartão de Crédito**: Processamento instantâneo
- **Cartão de Débito**: Processamento instantâneo
- **PIX**: Disponível para clientes no Brasil (requer configuração adicional)
- **Boleto**: Disponível para clientes no Brasil (expira em 3 dias)

### Configurar PIX e Boleto (Brasil)

1. No Dashboard do Stripe, vá em "Settings" → "Payment methods"
2. Ative "Boleto" e/ou "PIX"
3. Complete as configurações necessárias para o Brasil

## 6. Testar Pagamentos

### Cartões de Teste

Use estes números de cartão no modo de teste:

- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

**Detalhes do cartão de teste:**
- Data de validade: Qualquer data futura (ex: 12/34)
- CVV: Qualquer 3 dígitos (ex: 123)
- CEP: Qualquer CEP válido

## 7. Monitorar Pagamentos

1. Acesse o Dashboard do Stripe
2. Vá em "Payments" para ver todas as transações
3. Vá em "Customers" para ver os clientes
4. Vá em "Subscriptions" para gerenciar assinaturas

## 8. Preços dos Planos

Os planos configurados na plataforma:

- **Teste Grátis**: R$ 0 - 5 vagas por 1 semana
- **Bronze**: R$ 300/mês - 25 vagas
- **Prata**: R$ 500/mês - 50 vagas
- **Ouro**: R$ 800/mês - 100 vagas
- **Personalizado**: Sob consulta

## Suporte

- Documentação do Stripe: [https://stripe.com/docs](https://stripe.com/docs)
- API Reference: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- Suporte: [https://support.stripe.com](https://support.stripe.com)
