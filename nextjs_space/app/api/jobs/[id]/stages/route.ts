
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar todas as fases de uma vaga
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const jobId = params.id;

    // Verificar se o usuário tem acesso à vaga
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    if (job.userId !== session.user.id && session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar todas as fases ordenadas
    const stages = await db.jobStage.findMany({
      where: { jobId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Erro ao buscar fases:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fases da vaga' },
      { status: 500 }
    );
  }
}

// POST: Criar nova fase
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const jobId = params.id;
    const body = await request.json();
    const { name, description, order } = body;

    if (!name || order === undefined) {
      return NextResponse.json(
        { error: 'Nome e ordem são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem acesso à vaga
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    if (job.userId !== session.user.id && session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Criar a fase
    const stage = await db.jobStage.create({
      data: {
        jobId,
        name,
        description,
        order,
      },
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fase:', error);
    return NextResponse.json(
      { error: 'Erro ao criar fase da vaga' },
      { status: 500 }
    );
  }
}
