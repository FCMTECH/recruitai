# Script para Inicializar Banco de Dados na Vercel
# Execute no PowerShell

$VERCEL_URL = Read-Host "Cole a URL da Vercel (ex: https://recruitai-xyz.vercel.app)"
$MAINTENANCE_SECRET = "3977aa7046e9bf25ce7e91d535177b4c00794ec8fd29b98b5fc5a2697a455c1e"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INICIALIZANDO BANCO DE DADOS - RecruitAI" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Aplicar Schema do Prisma
Write-Host "[1/2] Aplicando schema do Prisma..." -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $MAINTENANCE_SECRET"
    "Content-Type" = "application/json"
}

$body1 = @{
    action = "prisma_push"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$VERCEL_URL/api/maintenance/execute" -Method POST -Headers $headers -Body $body1
    Write-Host "✅ Schema aplicado com sucesso!" -ForegroundColor Green
    Write-Host $response1.message -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Erro ao aplicar schema:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Passo 2: Popular Dados Iniciais
Write-Host "[2/2] Populando dados iniciais..." -ForegroundColor Yellow
Write-Host ""

$body2 = @{
    action = "run_seed"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$VERCEL_URL/api/maintenance/execute" -Method POST -Headers $headers -Body $body2
    Write-Host "✅ Dados populados com sucesso!" -ForegroundColor Green
    Write-Host $response2.message -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Erro ao popular dados:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🎉 BANCO INICIALIZADO COM SUCESSO!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Acesse: $VERCEL_URL/auth/signin" -ForegroundColor White
Write-Host "2. Faça login com:" -ForegroundColor White
Write-Host "   Email: admin@recruitai.com" -ForegroundColor White
Write-Host "   Senha: admin123" -ForegroundColor White
Write-Host ""
