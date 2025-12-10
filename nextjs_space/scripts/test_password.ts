import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@atsplatform.com' }
  });
  
  if (!user || !user.password) {
    console.log('❌ User or password not found');
    return;
  }
  
  const testPassword = 'Admin@123';
  const isValid = await bcrypt.compare(testPassword, user.password);
  
  console.log('Testing password:', testPassword);
  console.log('Password matches:', isValid);
  
  if (!isValid) {
    console.log('\n❌ Password does NOT match!');
    console.log('Expected password hash:', user.password);
  } else {
    console.log('\n✅ Password matches correctly!');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
