import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jobId = 'cmig3x58d000bxir5ndd71ul9';
  
  console.log('🔍 Buscando vaga:', jobId);
  
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          companyName: true
        }
      },
      applications: {
        include: {
          candidateProfile: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              profession: true,
              city: true,
              state: true
            }
          },
          currentStage: true
        }
      }
    }
  });
  
  if (!job) {
    console.log('❌ Vaga não encontrada!');
    return;
  }
  
  console.log('\n✅ Vaga encontrada:');
  console.log('  Título:', job.title);
  console.log('  Empresa:', job.user?.companyName);
  console.log('  Email:', job.user?.email);
  console.log('  Total de candidaturas:', job.applications.length);
  
  if (job.applications.length > 0) {
    console.log('\n📋 Candidaturas:');
    job.applications.forEach((app: any, index: number) => {
      console.log(`\n  ${index + 1}. ${app.candidateName}`);
      console.log('     Email:', app.candidateEmail);
      console.log('     candidateProfileId:', app.candidateProfileId);
      console.log('     Tem perfil?:', app.candidateProfile ? 'SIM' : 'NÃO');
      if (app.candidateProfile) {
        console.log('     Nome completo:', app.candidateProfile.fullName);
        console.log('     Profissão:', app.candidateProfile.profession);
      }
    });
  } else {
    console.log('\n❌ Nenhuma candidatura encontrada para esta vaga!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
