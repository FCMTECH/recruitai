# 🛠️ Guia de Manutenção - RecruitAI Produção

## 🎯 Problemas Corrigidos

### 1️⃣ **OAuth (Google/LinkedIn)**
- ✅ Adicionado `emailVerified` ao criar usuários via OAuth
- ✅ Usuários OAuth agora podem fazer login sem verificação manual

### 2️⃣ **NEXTAUTH_URL Dinâmica**
- ✅ `forgot-password`: usa headers do request para gerar URL correta
- ✅ `signup`: usa headers do request para links de boas-vindas
- ✅ Funciona em qualquer ambiente sem configuração manual

### 3️⃣ **Endpoints de Manutenção (NOVOS)**
- ✅ `/api/maintenance/ensure-superadmin`: garante existência de superadmin
- ✅ `/api/maintenance/ensure-plans`: garante existência dos planos padrão

---

## 🛡️ PASSO 1: Executar Endpoints de Manutenção

### **A) Garantir Superadmin**

```powershell
# Windows PowerShell
$body = @{
    secret = "3977aa7046e9bf25ce7e91d535177b4c00794ec8fd29b98b5fc5a2697a455c1e"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://www.recruitai.com.br/api/maintenance/ensure-superadmin" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Resposta Esperada:**
```json
{
  "message": "Superadmin criado com sucesso",
  "admin": {
    "email": "admin@recruitai.com.br",
    "name": "Administrador"
  },
  "credentials": {
    "email": "admin@recruitai.com.br",
    "password": "Admin@2025",
    "warning": "Altere a senha após o primeiro login!"
  }
}
```

OU (se já existir):
```json
{
  "message": "Superadmin já existe",
  "admin": {
    "email": "admin@recruitai.com.br",
    "name": "Administrador"
  }
}
```

---

### **B) Garantir Planos**

```powershell
# Windows PowerShell
$body = @{
    secret = "3977aa7046e9bf25ce7e91d535177b4c00794ec8fd29b98b5fc5a2697a455c1e"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://www.recruitai.com.br/api/maintenance/ensure-plans" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Resposta Esperada:**
```json
{
  "message": "Planos criados com sucesso",
  "count": 4,
  "plans": [
    { "name": "free", "displayName": "Plano Gratuito", "price": 0 },
    { "name": "starter", "displayName": "Plano Inicial", "price": 99.9 },
    { "name": "professional", "displayName": "Plano Profissional", "price": 299.9 },
    { "name": "enterprise", "displayName": "Plano Empresarial", "price": 799.9 }
  ]
}
```

OU (se já existirem):
```json
{
  "message": "Planos já existem",
  "count": 4,
  "plans": [...]
}
```

---

## 🧪 PASSO 2: Testes de Validação

### **1. Testar Login Admin**

1. Acesse: https://www.recruitai.com.br/auth/signin
2. Selecione: "Empresa"
3. Credenciais:
   - **Email:** `admin@recruitai.com.br`
   - **Senha:** `Admin@2025`
4. ✅ Deve redirecionar para `/admin`

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

---

### **2. Testar Cadastro de Novo Usuário (Empresa)**

1. Acesse: https://www.recruitai.com.br/auth/signup
2. Selecione: "Empresa"
3. Preencha:
   - Nome: `Teste Empresa`
   - Email: `teste@empresa.com`
   - Senha: `Teste@123`
   - Razão Social: `Teste Empresa LTDA`
   - CNPJ: `12.345.678/0001-90`
   - Telefone: `(11) 98765-4321`
4. Selecione um plano
5. Clique em "Criar Conta"
6. ✅ Deve receber email de boas-vindas
7. ✅ Deve conseguir fazer login

---

### **3. Testar Cadastro de Candidato**

1. Acesse: https://www.recruitai.com.br/auth/signup
2. Selecione: "Candidato"
3. Preencha:
   - Nome: `Teste Candidato`
   - Email: `teste@candidato.com`
   - Senha: `Teste@123`
4. Clique em "Criar Conta"
5. ✅ Deve receber email de boas-vindas
6. ✅ Deve conseguir fazer login

---

### **4. Testar Login com Google**

1. Acesse: https://www.recruitai.com.br/auth/signin
2. Selecione: "Candidato"
3. Clique em "Continuar com Google"
4. ✅ Deve autenticar com Google
5. ✅ Deve criar conta automaticamente como candidato
6. ✅ Deve redirecionar para `/candidate/dashboard`

---

### **5. Testar Login com LinkedIn**

1. Acesse: https://www.recruitai.com.br/auth/signin
2. Selecione: "Candidato"
3. Clique em "Continuar com LinkedIn"
4. ✅ Deve autenticar com LinkedIn
5. ✅ Deve criar conta automaticamente como candidato
6. ✅ Deve redirecionar para `/candidate/dashboard`

---

### **6. Testar Esqueceu a Senha**

1. Acesse: https://www.recruitai.com.br/auth/signin
2. Clique em "Esqueceu sua senha?"
3. Digite um email válido
4. ✅ Deve receber email com link de redefinição
5. Clique no link do email
6. ✅ Deve abrir página de redefinição
7. Digite nova senha
8. ✅ Deve resetar senha com sucesso
9. ✅ Deve conseguir fazer login com nova senha

---

### **7. Testar Página de Planos**

1. Acesse: https://www.recruitai.com.br/pricing
2. ✅ Deve exibir 4 planos:
   - Plano Gratuito (R$ 0,00)
   - Plano Inicial (R$ 99,90)
   - Plano Profissional (R$ 299,90)
   - Plano Empresarial (R$ 799,90)
3. ✅ Cada plano deve exibir suas features
4. ✅ Botões "Escolher Plano" devem funcionar

---

## 📝 Checklist de Validação

- [ ] Endpoints de manutenção executados com sucesso
- [ ] Superadmin existe e pode fazer login
- [ ] Planos estão disponíveis na página de pricing
- [ ] Cadastro de empresa funciona
- [ ] Cadastro de candidato funciona
- [ ] Login com Google funciona
- [ ] Login com LinkedIn funciona
- [ ] Esqueceu a senha funciona
- [ ] Emails estão sendo enviados

---

## ⚠️ Troubleshooting

### **Problema: "Não autorizado" ao executar endpoints**

**Solução:** Verifique se o `MAINTENANCE_SECRET` está correto:
```
3977aa7046e9bf25ce7e91d535177b4c00794ec8fd29b98b5fc5a2697a455c1e
```

### **Problema: OAuth não funciona**

**Solução:** 
1. Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos
2. Verifique se `LINKEDIN_CLIENT_ID` e `LINKEDIN_CLIENT_SECRET` estão corretos
3. Verifique se as URLs de callback estão configuradas:
   - Google: `https://www.recruitai.com.br/api/auth/callback/google`
   - LinkedIn: `https://www.recruitai.com.br/api/auth/callback/linkedin`

### **Problema: Emails não estão sendo enviados**

**Solução:**
1. Verifique configurações SMTP no .env da Vercel:
   - `SMTP_HOST=smtp.zoho.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=comercial@fcmtech.com.br`
   - `SMTP_PASS=xG1PbdchhJYP`
   - `SMTP_FROM_NAME=RecruitAI`

---

## 🚀 Próximos Passos

1. ✅ Executar endpoints de manutenção
2. ✅ Validar todos os testes acima
3. ✅ Alterar senha do admin
4. 📝 Documentar credenciais em local seguro
5. 📝 Monitorar logs de erro na Vercel

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da Vercel
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Execute os endpoints de manutenção novamente
4. Entre em contato com o suporte técnico
