import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@atsplatform.com' }
  });
  
  if (user) {
    console.log('✅ User found:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Has password:', !!user.password);
    console.log('- Password hash length:', user.password ? user.password.length : 0);
  } else {
    console.log('❌ User not found');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
