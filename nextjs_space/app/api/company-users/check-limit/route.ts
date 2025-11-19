
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/company-users/check-limit
 * Verifica se a empresa pode adicionar mais membros baseado no plano
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'company') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const userId = (session.user as any)?.id;

    // Buscar assinatura ativa
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['trial', 'active', 'grace_period']
        }
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!subscription) {
      return NextResponse.json({
        canAddMembers: false,
        reason: 'Nenhuma assinatura ativa encontrada',
        currentCount: 0,
        limit: 0
      });
    }

    // Contar membros atuais
    const currentMemberCount = await db.companyUser.count({
      where: {
        companyId: userId,
        isActive: true
      }
    });

    const memberLimit = subscription.plan.memberLimit;
    const canAddMembers = currentMemberCount < memberLimit;

    return NextResponse.json({
      canAddMembers,
      currentCount: currentMemberCount,
      limit: memberLimit,
      planName: subscription.plan.displayName,
      remaining: memberLimit - currentMemberCount
    });

  } catch (error) {
    console.error('Erro ao verificar limite de membros:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar limite de membros' },
      { status: 500 }
    );
  }
}
