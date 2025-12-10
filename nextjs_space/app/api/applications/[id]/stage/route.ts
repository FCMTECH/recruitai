
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH: Atualizar a fase de uma candidatura
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const applicationId = params.id;
    const body = await request.json();
    const { stageId } = body;

    // Buscar a candidatura
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Candidatura não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (
      application.job.userId !== session.user.id &&
      session.user.role !== 'superadmin'
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Se stageId for null, remove a fase
    // Se for uma string, verifica se a fase existe e pertence à vaga
    if (stageId) {
      const stage = await db.jobStage.findUnique({
        where: { id: stageId },
      });

      if (!stage) {
        return NextResponse.json({ error: 'Fase não encontrada' }, { status: 404 });
      }

      if (stage.jobId !== application.jobId) {
        return NextResponse.json(
          { error: 'Fase não pertence a esta vaga' },
          { status: 400 }
        );
      }
    }

    // Atualizar a fase da candidatura
    const updatedApplication = await db.application.update({
      where: { id: applicationId },
      data: {
        currentStageId: stageId || null,
      },
      include: {
        currentStage: true,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Erro ao atualizar fase da candidatura:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar fase da candidatura' },
      { status: 500 }
    );
  }
}
