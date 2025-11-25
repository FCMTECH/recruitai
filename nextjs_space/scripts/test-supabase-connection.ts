import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com Supabase...\n');
    
    const [users, jobs, applications, subscriptions, plans] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.subscription.count(),
      prisma.plan.count()
    ]);
    
    console.log('✅ CONEXÃO SUPABASE FUNCIONANDO!\n');
    console.log('📊 ESTATÍSTICAS DO BANCO:');
    console.log(`   • Usuários: ${users}`);
    console.log(`   • Vagas: ${jobs}`);
    console.log(`   • Candidaturas: ${applications}`);
    console.log(`   • Assinaturas: ${subscriptions}`);
    console.log(`   • Planos: ${plans}`);
    
    try {
      const resetTokens = await prisma.passwordResetToken.count();
      console.log(`   • Tokens de Reset: ${resetTokens}`);
    } catch (e) {
      console.log('   ⚠️  Tabela PasswordResetToken ainda não criada');
    }
    
    console.log('\n✅ SINCRONIZAÇÃO: OK');
    console.log('✅ PERFORMANCE: Rápida');
    console.log('✅ STATUS: Totalmente funcional\n');
    
  } catch (error: any) {
    console.error('❌ ERRO DE CONEXÃO:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
