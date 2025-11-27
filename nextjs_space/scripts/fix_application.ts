import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Corrigindo candidaturas sem candidateProfileId...\n');
  
  // Buscar todas as candidaturas sem candidateProfileId
  const applications = await prisma.application.findMany({
    where: {
      candidateProfileId: null
    },
    select: {
      id: true,
      candidateName: true,
      candidateEmail: true
    }
  });
  
  console.log(`📋 Encontradas ${applications.length} candidaturas sem perfil vinculado\n`);
  
  for (const app of applications) {
    console.log(`  Processando: ${app.candidateName} (${app.candidateEmail})`);
    
    // Buscar o perfil do candidato pelo email
    const profile = await prisma.candidateProfile.findUnique({
      where: { email: app.candidateEmail }
    });
    
    if (profile) {
      // Atualizar a candidatura com o candidateProfileId
      await prisma.application.update({
        where: { id: app.id },
        data: { candidateProfileId: profile.id }
      });
      console.log(`  ✅ Vinculado ao perfil: ${profile.fullName}\n`);
    } else {
      console.log(`  ⚠️  Perfil não encontrado para este email\n`);
    }
  }
  
  console.log('✅ Correção concluída!');
}

main()
  .catch(e => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
