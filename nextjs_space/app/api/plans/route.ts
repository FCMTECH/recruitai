
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar planos' },
      { status: 500 }
    );
  }
}
