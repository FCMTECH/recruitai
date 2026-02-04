import { db } from '../lib/db'

async function main() {
  try {
    console.log('🔌 Conectando ao banco de dados...')
    
    // Testar planos
    const plans = await db.plan.findMany()
    console.log(`\n📋 PLANOS (${plans.length}):`)
    plans.forEach(p => {
      console.log(`  - ${p.name}: ${p.displayName} (R$ ${p.price}) - ativo: ${p.isActive}`)
    })
    
    // Testar usuários
    const users = await db.user.findMany({ take: 5 })
    console.log(`\n👤 USUÁRIOS (${users.length}):`)
    users.forEach(u => {
      console.log(`  - ${u.email} (${u.role}) - verificado: ${!!u.emailVerified}`)
    })
    
    // Testar superadmin
    const superadmin = await db.user.findFirst({ where: { role: 'superadmin' } })
    console.log(`\n🔑 SUPERADMIN:`)
    if (superadmin) {
      console.log(`  - ${superadmin.email} (${superadmin.name})`)
    } else {
      console.log('  - NÃO EXISTE!')
    }
    
    console.log('\n✅ Conexão OK!')
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

main()
