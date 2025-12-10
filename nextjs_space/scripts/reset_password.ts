import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'comercial.fcmtech@gmail.com';
  const newPassword = 'fcmtech123';
  
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
  
  console.log('✅ Senha atualizada para:', email);
  console.log('   Nova senha:', newPassword);
}

main().catch(console.error).finally(() => prisma.$disconnect());
