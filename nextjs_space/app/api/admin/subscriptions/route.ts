
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/subscriptions
 * Lista todas as assinaturas com filtros
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'superadmin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const subscriptions = await db.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            displayName: true,
            price: true,
            jobLimit: true,
            memberLimit: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as { status: string }[];

    // Calcular estatísticas
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      trial: subscriptions.filter(s => s.status === 'trial').length,
      past_due: subscriptions.filter(s => s.status === 'past_due').length,
      canceled: subscriptions.filter(s => s.status === 'canceled').length,
      grace_period: subscriptions.filter(s => s.status === 'grace_period').length,
      expired: subscriptions.filter(s => s.status === 'expired').length
    };

    return NextResponse.json({
      subscriptions,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar assinaturas' },
      { status: 500 }
    );
  }
}
