
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const suspendSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório')
});

/**
 * POST /api/admin/subscriptions/[id]/suspend
 * Suspende uma assinatura
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
      return NextResponse.json({ error: 'Apenas administradores podem suspender assinaturas' }, { status: 403 });
    }

    const body = await req.json();
    const { reason } = suspendSchema.parse(body);

    // Buscar assinatura
    const subscription = await db.subscription.findUnique({
      where: { id: params.id }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
    }

    // Atualizar assinatura
    const updated = await db.subscription.update({
      where: { id: params.id },
      data: {
        status: 'canceled',
        suspensionReason: reason,
        endDate: new Date()
      }
    });

    return NextResponse.json({
      message: 'Assinatura suspensa com sucesso',
      subscription: updated
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao suspender assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao suspender assinatura' },
      { status: 500 }
    );
  }
}
