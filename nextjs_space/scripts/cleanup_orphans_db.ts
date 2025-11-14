
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carregar variáveis de ambiente
config();

const prisma = new PrismaClient();

async function cleanup() {
  try {
    console.log('🧹 Limpando dados órfãos...');
    
    // Limpar subscriptions órfãs
    const deletedSubs = await prisma.$executeRaw`
      DELETE FROM "Subscription" WHERE "userId" NOT IN (SELECT "id" FROM "User");
    `;
    console.log(`✓ ${deletedSubs} subscriptions órfãs removidas`);
    
    // Limpar applications órfãs
    const deletedApps1 = await prisma.$executeRaw`
      DELETE FROM "Application" WHERE "candidateProfileId" IS NOT NULL AND "candidateProfileId" NOT IN (SELECT "id" FROM "CandidateProfile");
    `;
    console.log(`✓ ${deletedApps1} applications com perfis órfãos removidas`);
    
    const deletedApps2 = await prisma.$executeRaw`
      DELETE FROM "Application" WHERE "jobId" NOT IN (SELECT "id" FROM "Job");
    `;
    console.log(`✓ ${deletedApps2} applications com jobs órfãos removidas`);
    
    // Limpar jobs órfãos
    const deletedJobs = await prisma.$executeRaw`
      DELETE FROM "Job" WHERE "userId" NOT IN (SELECT "id" FROM "User");
    `;
    console.log(`✓ ${deletedJobs} jobs órfãos removidos`);
    
    // Limpar notificações órfãs
    const deletedNotifs = await prisma.$executeRaw`
      DELETE FROM "Notification" WHERE "userId" NOT IN (SELECT "id" FROM "User");
    `;
    console.log(`✓ ${deletedNotifs} notificações órfãs removidas`);
    
    console.log('✅ Limpeza concluída!');
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
