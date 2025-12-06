#!/bin/bash

echo "================================================="
echo "🚀 Push RecruitAI para GitHub"
echo "================================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este diretório não é um repositório Git!"
    echo "Execute este script na pasta /home/ubuntu/ats_platform"
    exit 1
fi

# Solicitar URL do repositório
echo "📝 Digite a URL do seu repositório GitHub:"
echo "Exemplo: https://github.com/seu-usuario/recruitai.git"
read -p "URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ URL não fornecida. Encerrando."
    exit 1
fi

echo ""
echo "🔍 Verificando repositório remoto..."

# Remover remote existente (se houver)
git remote remove origin 2>/dev/null

# Adicionar novo remote
git remote add origin "$REPO_URL"

if [ $? -ne 0 ]; then
    echo "❌ Erro ao adicionar remote. Verifique a URL."
    exit 1
fi

echo "✅ Remote configurado com sucesso!"
echo ""

# Renomear branch para main
echo "🔄 Renomeando branch para 'main'..."
git branch -M main

# Fazer push
echo "📤 Fazendo push para GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================="
    echo "✅ PUSH REALIZADO COM SUCESSO!"
    echo "================================================="
    echo ""
    echo "🎯 PRÓXIMOS PASSOS:"
    echo ""
    echo "1️⃣  Acesse: https://vercel.com/new"
    echo "2️⃣  Conecte com GitHub"
    echo "3️⃣  Importe o repositório 'recruitai'"
    echo "4️⃣  ⚠️  CRÍTICO: Configure Root Directory = nextjs_space"
    echo "5️⃣  Adicione as variáveis de ambiente (veja VARIAVEIS_VERCEL.txt)"
    echo "6️⃣  Clique em Deploy"
    echo ""
    echo "📖 Guia completo: GUIA_DEPLOY_GITHUB_VERCEL.md"
    echo "================================================="
else
    echo ""
    echo "================================================="
    echo "❌ ERRO AO FAZER PUSH"
    echo "================================================="
    echo ""
    echo "Se o erro for de autenticação:"
    echo ""
    echo "1. Acesse: https://github.com/settings/tokens"
    echo "2. Clique em 'Generate new token (classic)'"
    echo "3. Marque os scopes: repo, workflow"
    echo "4. Copie o token gerado"
    echo "5. Tente o push novamente e use o token como senha"
    echo ""
    echo "Comando:"
    echo "git push -u origin main"
    echo ""
    echo "Username: seu_usuario_github"
    echo "Password: [cole o token aqui]"
    echo "================================================="
    exit 1
fi
