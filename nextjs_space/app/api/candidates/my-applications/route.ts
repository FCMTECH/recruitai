
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar todas as candidaturas de um candidato por email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const applications = await db.application.findMany({
      where: { candidateEmail: email },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            type: true,
            status: true,
            user: {
              select: {
                companyName: true,
              },
            },
          },
        },
        currentStage: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar candidaturas' },
      { status: 500 }
    );
  }
}
