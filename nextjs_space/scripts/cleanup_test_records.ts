import { db } from '@/lib/db';

async function cleanup() {
  try {
    console.log('🧹 Limpando registros de teste...');
    
    const deleted = await db.customPlanRequest.deleteMany({
      where: {
        OR: [
          { email: { contains: 'teste@' } },
          { email: { contains: 'test@' } },
          { name: { contains: 'Teste' } },
          { name: { contains: 'Test' } },
        ]
      }
    });
    
    console.log(`✅ ${deleted.count} registro(s) de teste deletado(s)`);
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.$disconnect();
  }
}

cleanup();
