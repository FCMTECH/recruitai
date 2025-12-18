import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';


export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é o email de teste
    const testModeEmail = process.env.TEST_MODE_EMAIL;
    if (!testModeEmail || session.user.email !== testModeEmail) {
      return NextResponse.json(
        { message: 'Modo de teste não disponível para este usuário' },
        { status: 403 }
      );
    }

    const { planId } = await request.json();

    // Buscar o plano
    const plan = await db.plan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { message: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma subscription ativa
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'trial'] }
      }
    });

    if (existingSubscription) {
      // Atualizar subscription existente
      await db.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId: plan.id,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          jobsCreatedThisMonth: 0,
          lastResetDate: new Date()
        }
      });
    } else {
      // Criar nova subscription
      await db.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          jobsCreatedThisMonth: 0,
          lastResetDate: new Date(),
          stripeCustomerId: `test_customer_${session.user.id}`,
          stripeSubscriptionId: `test_sub_${Date.now()}`
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Subscription de teste criada com sucesso!',
      testMode: true
    });
  } catch (error: any) {
    console.error('Erro ao criar subscription de teste:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao criar subscription de teste' },
      { status: 500 }
    );
  }
}
