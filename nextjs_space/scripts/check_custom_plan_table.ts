import { db } from '@/lib/db';

async function checkTable() {
  try {
    console.log('🔍 Verificando tabela CustomPlanRequest...');
    const count = await db.customPlanRequest.count();
    console.log(`✅ Tabela CustomPlanRequest existe e tem ${count} registros`);
    
    // Try to create a test record
    console.log('\n🧪 Testando criação de registro...');
    const testRecord = await db.customPlanRequest.create({
      data: {
        name: 'Test User',
        email: 'test@test.com',
        phone: '1234567890',
        message: 'Test message',
      },
    });
    console.log('✅ Registro de teste criado:', testRecord.id);
    
    // Delete test record
    await db.customPlanRequest.delete({ where: { id: testRecord.id } });
    console.log('✅ Registro de teste deletado');
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('\n⚠️  A tabela CustomPlanRequest NÃO existe no banco de dados');
      console.log('Execute: yarn prisma db push');
    }
  } finally {
    await db.$disconnect();
  }
}

checkTable();
