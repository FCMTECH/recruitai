import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🔧 Criando tabela CompanyInvitation...')

  try {
    // Criar tabela CompanyInvitation
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS "CompanyInvitation" (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        "companyName" TEXT NOT NULL,
        "tradeName" TEXT,
        cnpj TEXT,
        phone TEXT,
        token TEXT NOT NULL UNIQUE,
        "customPlanName" TEXT NOT NULL DEFAULT 'Plano Personalizado',
        "customJobLimit" INTEGER NOT NULL,
        "customPrice" DOUBLE PRECISION NOT NULL,
        "customFeatures" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        "stripeCustomerId" TEXT,
        "stripeCheckoutUrl" TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" TIMESTAMP(3),
        "createdBy" TEXT,
        notes TEXT
      )
    `
    console.log('✅ Tabela CompanyInvitation criada com sucesso')

    // Criar índices
    await db.$executeRaw`CREATE INDEX IF NOT EXISTS "CompanyInvitation_email_idx" ON "CompanyInvitation" (email)`
    console.log('✅ Índice email criado')

    await db.$executeRaw`CREATE INDEX IF NOT EXISTS "CompanyInvitation_token_idx" ON "CompanyInvitation" (token)`
    console.log('✅ Índice token criado')

    await db.$executeRaw`CREATE INDEX IF NOT EXISTS "CompanyInvitation_status_idx" ON "CompanyInvitation" (status)`
    console.log('✅ Índice status criado')

    await db.$executeRaw`CREATE INDEX IF NOT EXISTS "CompanyInvitation_createdBy_idx" ON "CompanyInvitation" ("createdBy")`
    console.log('✅ Índice createdBy criado')

    // Verificar se tabela foi criada
    const result = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "CompanyInvitation"
    `
    console.log('✅ Verificação final: Tabela CompanyInvitation OK')
    console.log('📊 Total de registros:', Number(result[0].count))
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('✅ Tabela CompanyInvitation já existe')
    } else {
      console.error('❌ Erro ao criar tabela:', error.message)
      throw error
    }
  }
}

main()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
