# ⚠️ CONFIGURAÇÃO OBRIGATÓRIA: Root Directory na Vercel

## ❌ Erro Atual
```
sh: line 1: cd: nextjs_space: No such file or directory
Error: Command "cd nextjs_space && npm install" exited with 1
```

## ✅ Solução: Configurar Root Directory

A Vercel precisa saber que o projeto Next.js está dentro do diretório `nextjs_space/`.

### Passos para Configurar:

1. **Acesse o Dashboard da Vercel**
   - Vá para: https://vercel.com/dashboard
   - Selecione o projeto **recruitai**

2. **Acesse as Configurações do Projeto**
   - Clique em **Settings** (Configurações)
   - No menu lateral, clique em **General**

3. **Configure o Root Directory**
   - Procure a seção **"Root Directory"**
   - Clique em **Edit** (Editar)
   - Digite: `nextjs_space`
   - Clique em **Save** (Salvar)

4. **Redeploy Automático**
   - A Vercel irá automaticamente fazer um novo deploy
   - Ou vá em **Deployments** e clique em **Redeploy**

---

## 📋 Configurações Esperadas

### Root Directory
```
nextjs_space
```

### Framework Preset
```
Next.js (detectado automaticamente)
```

### Build Command
```
npm run build
(ou deixe em branco para auto-detecção)
```

### Output Directory
```
.next
(padrão do Next.js)
```

### Install Command
```
npm install
(ou deixe em branco para auto-detecção)
```

---

## 🔍 Verificação

Após configurar, o próximo deploy deve:

✅ Detectar Next.js 14.2.28
✅ Executar `npm install` dentro de `nextjs_space/`
✅ Executar `prisma generate` via postinstall
✅ Executar `npm run build` com sucesso
✅ Gerar 98 rotas API
✅ Gerar 39 páginas
✅ Deploy com sucesso em https://www.recruitai.com.br

---

## 📊 Estrutura do Projeto

```
recruitai/
├── nextjs_space/          ← Root Directory (CONFIGURAR AQUI)
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── prisma/
│   ├── app/
│   ├── components/
│   └── lib/
├── documentação/
└── outros arquivos/
```

---

## ⚡ Comando Rápido (Alternativa)

Se preferir usar a CLI da Vercel:

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Configure o Root Directory
vercel --cwd nextjs_space
```

---

## 🚀 Após a Configuração

O próximo commit que você fizer será automaticamente deployed pela Vercel com a configuração correta do Root Directory.

**Nenhuma mudança de código é necessária!**

---

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique se o Root Directory está EXATAMENTE como `nextjs_space` (sem `/` no final)
2. Tente fazer um "Redeploy" manual no dashboard da Vercel
3. Verifique se todas as variáveis de ambiente estão configuradas
