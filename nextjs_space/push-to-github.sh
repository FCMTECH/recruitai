#!/bin/bash

echo "🚀 RecruitAI - Push para GitHub"
echo "================================"
echo ""

# Verificar se Git está inicializado
if [ ! -d ".git" ]; then
    echo "ℹ️ Inicializando repositório Git..."
    git init
    echo "✅ Git inicializado!"
else
    echo "✅ Repositório Git já existe"
fi

echo ""
echo "Por favor, informe a URL do seu repositório GitHub:"
echo "Exemplo: https://github.com/seu-usuario/recruitai.git"
read -p "URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Erro: URL não fornecida"
    exit 1
fi

echo ""
echo "📊 Adicionando arquivos..."
git add .

echo ""
echo "Digite a mensagem do commit:"
read -p "Mensagem (ou Enter para usar padrão): " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Initial commit: RecruitAI Platform"
fi

echo ""
echo "📝 Fazendo commit..."
git commit -m "$COMMIT_MSG"

echo ""
echo "🔗 Adicionando remote 'origin'..."
git remote remove origin 2>/dev/null
git remote add origin $REPO_URL

echo ""
echo "🌟 Renomeando branch para 'main'..."
git branch -M main

echo ""
echo "🚀 Fazendo push para GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 🎉 Código enviado para o GitHub com sucesso!"
    echo ""
    echo "Próximos passos:"
    echo "1. Acesse: https://vercel.com/new"
    echo "2. Importe o repositório: $REPO_URL"
    echo "3. Configure 'Root Directory' como: nextjs_space"
    echo "4. Adicione as variáveis de ambiente (veja GITHUB_SETUP.md)"
    echo "5. Clique em 'Deploy'"
    echo ""
else
    echo ""
    echo "❌ Erro ao fazer push para o GitHub"
    echo "Verifique:"
    echo "- Se a URL do repositório está correta"
    echo "- Se você tem permissão de escrita no repositório"
    echo "- Se suas credenciais do GitHub estão configuradas"
    exit 1
fi
