import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.job.findMany({
    include: {
      user: true
    }
  });
  
  const orphanJobs = jobs.filter((job: any) => !job.user);
  
  console.log('Total jobs:', jobs.length);
  console.log('Orphan jobs (without user):', orphanJobs.length);
  
  if (orphanJobs.length > 0) {
    console.log('\nOrphan jobs details:');
    orphanJobs.forEach((job: any) => {
      console.log(`- Job ID: ${job.id}, Title: ${job.title}, UserID: ${job.userId}`);
    });
    
    console.log('\n🗑️  Deleting orphan jobs...');
    for (const job of orphanJobs) {
      await prisma.job.delete({
        where: { id: job.id }
      });
      console.log(`✅ Deleted job: ${job.title}`);
    }
  } else {
    console.log('✅ No orphan jobs found');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
