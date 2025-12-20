import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const defaultPlans = [
  {
    name: 'free',
    displayName: 'Plano Gratuito',
    price: 0,
    jobLimit: 1,
    memberLimit: 1,
    features: [
      '1 vaga ativa',
      'Análise básica de candidatos',
      'Suporte por email'
    ],
    isActive: true,
    isCustom: false
  },
  {
    name: 'starter',
    displayName: 'Plano Inicial',
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
    displayName: 'Plano Profissional',
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
    displayName: 'Plano Empresarial',
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

    const existingPlans = await db.plan.findMany({
      where: { isActive: true }
    });

    if (existingPlans.length > 0) {
      return NextResponse.json({
        message: 'Planos já existem',
        count: existingPlans.length,
        plans: existingPlans.map(p => ({ name: p.name, displayName: p.displayName, price: p.price }))
      });
    }

    const createdPlans: any[] = [];
    for (const planData of defaultPlans) {
      const plan = await db.plan.upsert({
        where: { name: planData.name },
        update: planData,
        create: planData
      });
      createdPlans.push(plan);
    }

    return NextResponse.json({
      message: 'Planos criados com sucesso',
      count: createdPlans.length,
      plans: createdPlans.map(p => ({ name: p.name, displayName: p.displayName, price: p.price }))
    });

  } catch (error) {
    console.error('Erro ao garantir planos:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}