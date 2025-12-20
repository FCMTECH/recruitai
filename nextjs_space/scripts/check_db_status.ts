import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('\n🔍 Verificando status do banco de dados...\n');

    const plans = await prisma.plan.findMany({
      where: { isActive: true }
    });
    console.log(`📋 Planos ativos: ${plans.length}`);
    if (plans.length > 0) {
      plans.forEach(plan => {
        console.log(`   - ${plan.displayName}: R$ ${plan.price}`);
      });
    } else {
      console.log('   ⚠️  Nenhum plano ativo!');
    }

    console.log('\n👥 Verificando superadmins...');
    const superadmins = await prisma.user.findMany({
      where: { role: 'superadmin' }
    });
    console.log(`   Superadmins: ${superadmins.length}`);
    if (superadmins.length > 0) {
      superadmins.forEach(admin => {
        console.log(`   - ${admin.name || admin.email} (${admin.email})`);
      });
    } else {
      console.log('   ⚠️  Nenhum superadmin!');
    }

    console.log('\n🏢 Empresas: ' + await prisma.user.count({ where: { role: 'company' } }));
    console.log('👤 Candidatos: ' + await prisma.user.count({ where: { role: 'candidate' } }));

    console.log('\n✅ Verificação concluída!\n');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();