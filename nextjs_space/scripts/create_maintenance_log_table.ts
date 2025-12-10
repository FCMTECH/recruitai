import { db } from '@/lib/db';

async function createTable() {
  try {
    console.log('🛠️  Criando tabela MaintenanceLog...');
    
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MaintenanceLog" (
        "id" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "params" TEXT,
        "result" TEXT,
        "status" TEXT NOT NULL,
        "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
      );
    `);
    
    console.log('✅ Tabela criada!');
    
    // Create indexes
    console.log('\n🛠️  Criando índices...');
    
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "MaintenanceLog_action_idx" ON "MaintenanceLog"("action");
    `);
    
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "MaintenanceLog_status_idx" ON "MaintenanceLog"("status");
    `);
    
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "MaintenanceLog_executedAt_idx" ON "MaintenanceLog"("executedAt");
    `);
    
    console.log('✅ Índices criados!');
    
    // Verify
    console.log('\n✅ Verificando tabela...');
    const count = await db.maintenanceLog.count();
    console.log(`✅ Tabela MaintenanceLog criada com sucesso! Registros: ${count}`);
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tabela já existe!');
    }
  } finally {
    await db.$disconnect();
  }
}

createTable();
