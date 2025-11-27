import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jobId = 'cmig3x58d000bxir5ndd71ul9';
  
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      user: true
    }
  });
  
  if (job) {
    console.log('Vaga:', job.title);
    console.log('Proprietário:');
    console.log('  ID:', job.user.id);
    console.log('  Email:', job.user.email);
    console.log('  Nome:', job.user.name);
    console.log('  Empresa:', job.user.companyName);
    console.log('  Role:', job.user.role);
    console.log('\n✅ Use este email para fazer login!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
