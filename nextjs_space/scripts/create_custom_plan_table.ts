import { db } from '@/lib/db';

async function createTable() {
  try {
    console.log('🛠️  Criando tabela CustomPlanRequest...');
    
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CustomPlanRequest" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "message" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "CustomPlanRequest_pkey" PRIMARY KEY ("id")
      );
    `);
    
    console.log('✅ Tabela criada!');
    
    // Create indexes
    console.log('\n🛠️  Criando índices...');
    
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CustomPlanRequest_email_idx" ON "CustomPlanRequest"("email");
    `);
    
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CustomPlanRequest_status_idx" ON "CustomPlanRequest"("status");
    `);
    
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CustomPlanRequest_createdAt_idx" ON "CustomPlanRequest"("createdAt");
    `);
    
    console.log('✅ Índices criados!');
    
    // Verify
    console.log('\n✅ Verificando tabela...');
    const count = await db.customPlanRequest.count();
    console.log(`✅ Tabela CustomPlanRequest criada com sucesso! Registros: ${count}`);
    
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
