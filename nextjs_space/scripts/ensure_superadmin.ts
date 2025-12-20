import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function ensureSuperadmin() {
  try {
    console.log('\n🔍 Verificando existência de superadmin...\n');

    const existingSuperadmin = await prisma.user.findFirst({
      where: { role: 'superadmin' }
    });

    if (existingSuperadmin) {
      console.log('✅ Superadmin já existe:');
      console.log(`   Nome: ${existingSuperadmin.name}`);
      console.log(`   Email: ${existingSuperadmin.email}`);
      console.log(`   Email Verificado: ${existingSuperadmin.emailVerified ? 'Sim' : 'Não'}`);
      
      // Se não estiver verificado, verificar agora
      if (!existingSuperadmin.emailVerified) {
        await prisma.user.update({
          where: { id: existingSuperadmin.id },
          data: { emailVerified: new Date() }
        });
        console.log('✅ Email do superadmin foi verificado!');
      }
      
      return;
    }

    console.log('⚠️  Nenhum superadmin encontrado. Criando...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@recruitai.com.br';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2025';
    const adminName = process.env.ADMIN_NAME || 'Administrador';

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'superadmin',
        companyName: '',
        emailVerified: new Date()
      }
    });

    console.log('\n✅ Superadmin criado com sucesso!');
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

  } catch (error) {
    console.error('❌ Erro ao garantir superadmin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

ensureSuperadmin();