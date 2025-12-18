# 🔗 Configuração de Integração GitHub → Vercel (Auto-Deploy)

## 🎯 **Objetivo**

Configurar a integração automática entre o repositório GitHub e a Vercel para que:
- ✅ Cada commit na branch `main` dispare um deploy automático
- ✅ Não seja necessário fazer deploy manual
- ✅ Todos os commits tenham o autor correto configurado

---

## 📝 **1. Configuração do Git (Local)**

### **1.1 - Configurar Autor Global**

No seu computador, execute estes comandos **UMA ÚNICA VEZ**:

```bash
git config --global user.name "FCMTECH"
git config --global user.email "comercial.fcmtech@gmail.com"
```

### **1.2 - Verificar Configuração**

```bash
git config --global --list | grep -E "(user.name|user.email)"
```

**Resultado esperado:**
```
user.name=FCMTECH
user.email=comercial.fcmtech@gmail.com
```

### **1.3 - Verificar Email no GitHub**

1. Acesse: `https://github.com/settings/emails`
2. Confirme que `comercial.fcmtech@gmail.com` está **verificado**
3. Se não estiver, clique em **"Verify email address"** e confirme

---

## 🔗 **2. Integração GitHub → Vercel**

### **2.1 - Verificar Conexão Existente**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`

2. Você deve ver:
```
Connected Git Repository:
FCMTECH/recruitai
```

### **2.2 - Se NÃO Estiver Conectado**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`

2. Clique em **"Connect Git Repository"**

3. Selecione: **"GitHub"**

4. Autorize a Vercel a acessar sua conta GitHub

5. Selecione o repositório: **`FCMTECH/recruitai`**

6. Confirme a conexão

### **2.3 - Configurar Branch de Deploy**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`

2. Em **"Production Branch"**, confirme que está: **`main`**

3. Se estiver diferente, altere para **`main`**

4. Clique em **"Save"**

---

## ⚙️ **3. Configurações Específicas da Vercel**

### **3.1 - Root Directory**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/general`

2. Em **"Root Directory"**, confirme que está: **`nextjs_space`**

3. Se estiver diferente, altere para **`nextjs_space`**

4. Clique em **"Save"**

### **3.2 - Build & Development Settings**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/general`

2. Confirme estas configurações:

```
Framework Preset: Next.js
Build Command: (deixe vazio, usará vercel.json)
Install Command: (deixe vazio, usará vercel.json)
Output Directory: (deixe vazio)
```

---

## 🔔 **4. Webhook Automático GitHub → Vercel**

### **4.1 - Verificar Webhook Existente**

1. Vá em: `https://github.com/FCMTECH/recruitai/settings/hooks`

2. Você deve ver um webhook da Vercel:
```
https://api.vercel.com/v1/integrations/deploy/...
```

3. Clique no webhook para ver detalhes

4. Verifique se está: **✅ Active**

### **4.2 - Se NÃO Houver Webhook (Criar Manualmente)**

Se por algum motivo o webhook não existir:

1. Vá em: `https://github.com/FCMTECH/recruitai/settings/hooks`

2. Clique em **"Add webhook"**

3. Configure:
```
Payload URL: (obtenha da Vercel em Settings > Git)
Content type: application/json
Secret: (deixe vazio)
SSL verification: Enable SSL verification
```

4. Em **"Which events would you like to trigger this webhook?"**:
   - Selecione: **"Just the push event"**

5. Marque: **✅ Active**

6. Clique em **"Add webhook"**

### **4.3 - Recriar Webhook (Se Estiver Com Problemas)**

Se o webhook estiver com falhas:

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/git`

2. Clique em **"Disconnect"** (remover repositório)

3. Clique em **"Connect Git Repository"** novamente

4. Selecione: **`FCMTECH/recruitai`**

5. Isso vai recriar o webhook automaticamente

---

## 📦 **5. Testar Integração Automática**

### **5.1 - Fazer um Commit de Teste**

```bash
cd /caminho/do/seu/projeto
git commit --allow-empty -m "Test: Trigger automatic Vercel deployment"
git push origin main
```

### **5.2 - Verificar Deploy Automático**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/deployments`

2. Você deve ver um **novo deploy** iniciando em **1-2 minutos**

3. O status deve mudar de:
   - 🟠 **Building** → 🟢 **Ready**

4. Nos logs, você deve ver:
```
Cloning github.com/FCMTECH/recruitai (Branch: main, Commit: [hash])
```

---

## 📊 **6. Verificação de Status**

### **6.1 - GitHub Webhook Logs**

1. Vá em: `https://github.com/FCMTECH/recruitai/settings/hooks`

2. Clique no webhook da Vercel

3. Clique na aba **"Recent Deliveries"**

4. Você deve ver entregas **recentes** com:
   - ✅ Status: **200 OK**

### **6.2 - Vercel Deployment Status**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/deployments`

2. Cada commit na branch `main` deve ter um deploy correspondente

3. Verifique se o **hash do commit** nos logs da Vercel corresponde ao **hash no GitHub**

---

## ⚠️ **7. Solução de Problemas**

### **Problema 1: Deploy Não Inicia Após Commit**

**Causa:** Webhook não está funcionando

**Solução:**
1. Vá em: `https://github.com/FCMTECH/recruitai/settings/hooks`
2. Clique no webhook da Vercel
3. Clique em **"Redeliver"** em uma entrega recente
4. Se falhar, recrie a conexão GitHub → Vercel (passo 4.3)

### **Problema 2: Erro "A commit author is required"**

**Causa:** Commits sem autor configurado

**Solução:**
1. Configure o autor globalmente (passo 1.1)
2. Verifique com: `git log -1 --format="%an <%ae>"`
3. Resultado esperado: `FCMTECH <comercial.fcmtech@gmail.com>`

### **Problema 3: Deploy Usa Commit Antigo**

**Causa:** Cache do webhook ou branch errada

**Solução:**
1. Verifique se a branch está em `main` (passo 2.3)
2. Force um novo push:
```bash
git commit --allow-empty -m "Force deploy"
git push origin main --force
```
3. Recrie a conexão GitHub → Vercel (passo 4.3)

### **Problema 4: Build Falha na Vercel**

**Causa:** Erros de TypeScript ou dependências

**Solução:**
1. Teste o build localmente:
```bash
cd nextjs_space
yarn build
```
2. Corrija os erros que aparecerem
3. Commit e push das correções

---

## ✅ **8. Checklist de Validação**

Confirme que todos estes itens estão **✅**:

- [ ] Git configurado com autor: `FCMTECH <comercial.fcmtech@gmail.com>`
- [ ] Email verificado no GitHub
- [ ] Repositório conectado à Vercel: `FCMTECH/recruitai`
- [ ] Branch de produção: `main`
- [ ] Root Directory: `nextjs_space`
- [ ] Webhook do GitHub ativo e funcionando
- [ ] Commit de teste disparou deploy automático
- [ ] Deploy completado com sucesso
- [ ] Site acessível em: `https://www.recruitai.com.br`

---

## 🚀 **9. Fluxo de Trabalho Ideal**

Após a configuração, o fluxo deve ser:

1. **Desenvolver localmente:**
```bash
cd /caminho/do/projeto/nextjs_space
# ... fazer alterações no código ...
yarn build  # Testar build local
```

2. **Commit e Push:**
```bash
cd ..
git add .
git commit -m "Descrição das alterações"
git push origin main
```

3. **Deploy Automático:**
   - A Vercel detecta o push (webhook)
   - Inicia o build automaticamente
   - Deploy completa em 5-7 minutos
   - Site atualizado em: `https://www.recruitai.com.br`

4. **NÃO É NECESSÁRIO:**
   - Acessar painel da Vercel manualmente
   - Clicar em "Deploy" manualmente
   - Fazer nenhuma ação adicional

---

## 📊 **10. Monitoramento**

### **10.1 - GitHub Actions (Opcional)**

Para monitorar os deploys pelo GitHub:

1. Vá em: `https://github.com/FCMTECH/recruitai/actions`
2. Você verá os workflows de CI/CD (se configurados)

### **10.2 - Vercel Dashboard**

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/deployments`
2. Monitore os deploys em tempo real
3. Clique em um deploy para ver logs completos

### **10.3 - Notificações**

Configure notificações de deploy:

1. Vá em: `https://vercel.com/fcm-techs-projects/recruitai/settings/notifications`
2. Ative: **"Deployment Ready"** e **"Deployment Failed"**
3. Escolha: Email ou Slack

---

## 📖 **11. Documentação Adicional**

- **Vercel Git Integration:** https://vercel.com/docs/deployments/git
- **GitHub Webhooks:** https://docs.github.com/en/webhooks
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## 📝 **Resumo**

| Item | Status | Ação |
|------|--------|-------|
| **Git Autor** | ✅ | `FCMTECH <comercial.fcmtech@gmail.com>` |
| **Repositório** | ✅ | `FCMTECH/recruitai` |
| **Branch** | ✅ | `main` |
| **Root Directory** | ✅ | `nextjs_space` |
| **Webhook** | ✅ | Ativo e funcionando |
| **Deploy Automático** | ✅ | Configurado e testado |

---

**Data:** 10/12/2025 - 04:10
**Status:** ✅ Configuração completa e testada
**Próximo Deploy:** Automático no próximo push para `main`
