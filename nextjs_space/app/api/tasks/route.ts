
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar tarefas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const whereClause: any = {
      userId: user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tarefas' },
      { status: 500 }
    );
  }
}

// POST: Criar nova tarefa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const data = await req.json();
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      jobId,
      applicationId,
    } = data;

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    const task = await db.task.create({
      data: {
        userId: user.id,
        title,
        description,
        priority: priority || 'medium',
        status: status || 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        jobId,
        applicationId,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    );
  }
}
