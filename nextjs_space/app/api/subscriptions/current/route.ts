
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['trial', 'active', 'past_due']
        }
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar assinatura' },
      { status: 500 }
    );
  }
}
