import { db } from '@/lib/db';

async function createTables() {
  try {
    console.log('🛠️  Criando tabelas do sistema de suporte...');
    
    // Criar tabela SupportTicket
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SupportTicket" (
        "id" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'open',
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "closedAt" TIMESTAMP(3),
        
        CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SupportTicket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ Tabela SupportTicket criada!');
    
    // Criar índices para SupportTicket
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_companyId_idx" ON "SupportTicket"("companyId");`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status");`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_priority_idx" ON "SupportTicket"("priority");`);
    console.log('✅ Índices de SupportTicket criados!');
    
    // Criar tabela SupportMessage
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SupportMessage" (
        "id" TEXT NOT NULL,
        "ticketId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ Tabela SupportMessage criada!');
    
    // Criar índices para SupportMessage
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportMessage_ticketId_idx" ON "SupportMessage"("ticketId");`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportMessage_createdAt_idx" ON "SupportMessage"("createdAt");`);
    console.log('✅ Índices de SupportMessage criados!');
    
    // Criar tabela MemberInvitation
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MemberInvitation" (
        "id" TEXT NOT NULL,
        "companyId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "groupId" TEXT,
        "permissionId" TEXT,
        "token" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "acceptedAt" TIMESTAMP(3),
        
        CONSTRAINT "MemberInvitation_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "MemberInvitation_token_key" UNIQUE ("token"),
        CONSTRAINT "MemberInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('✅ Tabela MemberInvitation criada!');
    
    // Criar índices para MemberInvitation
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemberInvitation_companyId_idx" ON "MemberInvitation"("companyId");`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemberInvitation_email_idx" ON "MemberInvitation"("email");`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemberInvitation_token_idx" ON "MemberInvitation"("token");`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "MemberInvitation_status_idx" ON "MemberInvitation"("status");`);
    console.log('✅ Índices de MemberInvitation criados!');
    
    // Adicionar colunas ao Plan se não existirem
    try {
      await db.$executeRawUnsafe(`ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "isCustom" BOOLEAN NOT NULL DEFAULT false;`);
      await db.$executeRawUnsafe(`ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "customCompanyId" TEXT;`);
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Plan_customCompanyId_idx" ON "Plan"("customCompanyId");`);
      console.log('✅ Colunas de plano personalizado adicionadas!');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('ℹ️  Colunas de plano personalizado já existem!');
      } else {
        throw err;
      }
    }
    
    console.log('\n✅ Todas as tabelas foram criadas com sucesso!');
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Algumas tabelas já existem!');
    }
  } finally {
    await db.$disconnect();
  }
}

createTables();
