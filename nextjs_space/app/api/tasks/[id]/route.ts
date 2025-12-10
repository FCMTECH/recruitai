
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar tarefa específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const task = await db.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Erro ao buscar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tarefa' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar tarefa
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const task = await db.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'completed' && !task.completedAt) {
        updateData.completedAt = new Date();
      } else if (data.status !== 'completed' && task.completedAt) {
        updateData.completedAt = null;
      }
    }
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.jobId !== undefined) updateData.jobId = data.jobId;
    if (data.applicationId !== undefined) updateData.applicationId = data.applicationId;

    const updatedTask = await db.task.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error: any) {
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    );
  }
}

// DELETE: Remover tarefa
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const task = await db.task.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    await db.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Tarefa removida com sucesso' });
  } catch (error: any) {
    console.error('Erro ao remover tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao remover tarefa' },
      { status: 500 }
    );
  }
}
