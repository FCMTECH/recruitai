
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    // Verificar se o usuário já tem uma assinatura ativa
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['trial', 'active']
        }
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { message: 'Você já possui uma assinatura ativa' },
        { status: 400 }
      );
    }

    // Verificar se o plano é realmente o plano free
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan || plan.name !== 'free') {
      return NextResponse.json(
        { message: 'Plano inválido para teste grátis' },
        { status: 400 }
      );
    }

    // Criar assinatura de teste
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 1 semana

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId: plan.id,
        status: 'trial',
        trialEndsAt: trialEndsAt,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
        jobsCreatedThisMonth: 0
      }
    });

    return NextResponse.json({ 
      success: true,
      subscription 
    });
  } catch (error) {
    console.error('Erro ao criar assinatura de teste:', error);
    return NextResponse.json(
      { message: 'Erro ao criar assinatura de teste' },
      { status: 500 }
    );
  }
}
