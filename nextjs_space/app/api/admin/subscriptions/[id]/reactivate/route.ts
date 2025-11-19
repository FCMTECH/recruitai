
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/subscriptions/[id]/reactivate
 * Reativa uma assinatura suspensa
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
      return NextResponse.json({ error: 'Apenas administradores podem reativar assinaturas' }, { status: 403 });
    }

    // Buscar assinatura
    const subscription = await db.subscription.findUnique({
      where: { id: params.id }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
    }

    // Calcular nova data de fim (30 dias a partir de agora)
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);

    // Atualizar assinatura
    const updated = await db.subscription.update({
      where: { id: params.id },
      data: {
        status: 'active',
        suspensionReason: null,
        gracePeriodEndDate: null,
        gracePeriodDays: null,
        endDate: newEndDate
      }
    });

    return NextResponse.json({
      message: 'Assinatura reativada com sucesso',
      subscription: updated
    });

  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao reativar assinatura' },
      { status: 500 }
    );
  }
}
