import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    const subscriptionId = params.id;
    const body = await request.json();
    const { planName, price, jobLimit, memberLimit, features } = body;

    // Validações
    if (!planName || price === undefined || !jobLimit || !memberLimit) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar a subscription
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: true,
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe um plano personalizado para esta empresa
    const existingCustomPlan = await db.plan.findFirst({
      where: {
        isCustom: true,
        customCompanyId: subscription.userId,
      },
    });

    let customPlan;

    if (existingCustomPlan) {
      // Atualizar plano personalizado existente
      customPlan = await db.plan.update({
        where: { id: existingCustomPlan.id },
        data: {
          displayName: planName,
          price: parseFloat(price.toString()),
          jobLimit: parseInt(jobLimit.toString()),
          memberLimit: parseInt(memberLimit.toString()),
          features: features ? features.split(',').map((f: string) => f.trim()) : [],
          updatedAt: new Date(),
        },
      });
    } else {
      // Criar novo plano personalizado
      const uniqueName = `custom_${subscription.userId}_${Date.now()}`;
      customPlan = await db.plan.create({
        data: {
          name: uniqueName,
          displayName: planName,
          price: parseFloat(price.toString()),
          jobLimit: parseInt(jobLimit.toString()),
          memberLimit: parseInt(memberLimit.toString()),
          features: features ? features.split(',').map((f: string) => f.trim()) : [],
          isActive: true,
          isCustom: true,
          customCompanyId: subscription.userId,
        },
      });
    }

    // Atualizar a subscription para usar o plano personalizado
    // Status 'pending_payment' para que o cliente pague pelo plano
    const updatedSubscription = await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: customPlan.id,
        status: customPlan.price > 0 ? 'pending_payment' : 'active', // Se gratuito, ativa direto
        endDate: null, // Será definido após pagamento
        updatedAt: new Date(),
      },
      include: {
        plan: true,
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: customPlan.price > 0 
        ? 'Plano personalizado aplicado. O cliente precisa realizar o pagamento.'
        : 'Plano personalizado gratuito aplicado com sucesso',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Erro ao personalizar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao personalizar plano' },
      { status: 500 }
    );
  }
}
