import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const defaultPlans = [
  {
    name: 'free',
    displayName: 'Gratuito',
    price: 0,
    jobLimit: 1,
    memberLimit: 1,
    features: [
      '1 vaga ativa',
      'Análise básica de candidatos',
      'Suporte por email'
    ],
    stripePriceId: null,
    isActive: true,
    isCustom: false
  },
  {
    name: 'starter',
    displayName: 'Starter',
    price: 99.90,
    jobLimit: 5,
    memberLimit: 3,
    features: [
      'Até 5 vagas ativas',
      'Análise avançada de candidatos',
      'Suporte prioritário',
      'Relatórios básicos'
    ],
    stripePriceId: null,
    isActive: true,
    isCustom: false
  },
  {
    name: 'professional',
    displayName: 'Professional',
    price: 299.90,
    jobLimit: 20,
    memberLimit: 10,
    features: [
      'Até 20 vagas ativas',
      'Análise avançada com IA',
      'Suporte prioritário 24/7',
      'Relatórios avançados',
      'Gestão de equipe',
      'Integrações básicas'
    ],
    stripePriceId: null,
    isActive: true,
    isCustom: false
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: 799.90,
    jobLimit: 100,
    memberLimit: 50,
    features: [
      'Até 100 vagas ativas',
      'Análise avançada com IA',
      'Suporte dedicado 24/7',
      'Relatórios personalizados',
      'Gestão completa de equipe',
      'Integrações customizadas',
      'Gerente de conta dedicado'
    ],
    stripePriceId: null,
    isActive: true,
    isCustom: false
  }
];

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();

    if (secret !== process.env.MAINTENANCE_SECRET) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log('🔧 Iniciando sincronização de planos...');

    const upsertedPlans: any[] = [];
    
    for (const planData of defaultPlans) {
      try {
        const plan = await db.plan.upsert({
          where: { name: planData.name },
          update: {
            displayName: planData.displayName,
            price: planData.price,
            jobLimit: planData.jobLimit,
            memberLimit: planData.memberLimit,
            features: planData.features,
            stripePriceId: planData.stripePriceId,
            isActive: planData.isActive,
            isCustom: planData.isCustom
          },
          create: planData
        });
        
        console.log(`✅ Plano ${plan.name} (${plan.displayName}) sincronizado`);
        upsertedPlans.push(plan);
      } catch (planError) {
        console.error(`❌ Erro ao processar plano ${planData.name}:`, planError);
      }
    }

    // Verificar planos ativos após sincronização
    const activePlans = await db.plan.findMany({
      where: { isActive: true, isCustom: false },
      orderBy: { price: 'asc' }
    });

    console.log(`✅ Total de planos ativos: ${activePlans.length}`);

    return NextResponse.json({
      success: true,
      message: `${upsertedPlans.length} planos sincronizados com sucesso`,
      totalActive: activePlans.length,
      plans: activePlans.map(p => ({
        id: p.id,
        name: p.name,
        displayName: p.displayName,
        price: p.price,
        jobLimit: p.jobLimit,
        memberLimit: p.memberLimit,
        features: p.features
      }))
    });

  } catch (error) {
    console.error('❌ Erro ao sincronizar planos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao processar solicitação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}