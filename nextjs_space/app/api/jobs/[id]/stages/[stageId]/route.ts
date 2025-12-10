
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH: Atualizar fase
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; stageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: jobId, stageId } = params;
    const body = await request.json();
    const { name, description, order } = body;

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

    // Atualizar a fase
    const stage = await db.jobStage.update({
      where: { id: stageId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error('Erro ao atualizar fase:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar fase da vaga' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir fase
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; stageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: jobId, stageId } = params;

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

    // Excluir a fase
    await db.jobStage.delete({
      where: { id: stageId },
    });

    return NextResponse.json({ message: 'Fase excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fase:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir fase da vaga' },
      { status: 500 }
    );
  }
}
