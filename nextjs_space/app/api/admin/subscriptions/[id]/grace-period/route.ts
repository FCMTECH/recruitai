
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const gracePeriodSchema = z.object({
  days: z.number().min(1).max(90), // 1 a 90 dias
  reason: z.string().optional()
});

/**
 * POST /api/admin/subscriptions/[id]/grace-period
 * Concede período de graça para uma assinatura
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'superadmin') {
      return NextResponse.json({ error: 'Apenas administradores podem conceder período de graça' }, { status: 403 });
    }

    const body = await req.json();
    const { days, reason } = gracePeriodSchema.parse(body);

    // Buscar assinatura
    const subscription = await db.subscription.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            email: true,
            companyName: true
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
    }

    // Calcular data de fim do período de graça
    const gracePeriodEndDate = new Date();
    gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + days);

    // Atualizar assinatura
    const updated = await db.subscription.update({
      where: { id: params.id },
      data: {
        status: 'grace_period',
        gracePeriodEndDate,
        gracePeriodDays: days,
        suspensionReason: reason || `Período de graça concedido por ${days} dias`
      }
    });

    return NextResponse.json({
      message: `Período de graça de ${days} dias concedido com sucesso`,
      subscription: updated,
      gracePeriodEndDate
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao conceder período de graça:', error);
    return NextResponse.json(
      { error: 'Erro ao conceder período de graça' },
      { status: 500 }
    );
  }
}
