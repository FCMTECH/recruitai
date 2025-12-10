import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find jobs with userId that doesn't exist in User table
  const orphanJobs = await prisma.$queryRaw`
    SELECT j.id, j.title, j."userId"
    FROM "Job" j
    LEFT JOIN "User" u ON j."userId" = u.id
    WHERE u.id IS NULL
  `;
  
  console.log('Orphan jobs found:', (orphanJobs as any[]).length);
  
  if ((orphanJobs as any[]).length > 0) {
    console.log('\nDeleting orphan jobs...');
    for (const job of (orphanJobs as any[])) {
      console.log(`- Deleting: ${job.title} (ID: ${job.id})`);
      await prisma.job.delete({
        where: { id: job.id }
      });
    }
    console.log('\n✅ Cleanup completed');
  } else {
    console.log('✅ No orphan jobs to clean up');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
