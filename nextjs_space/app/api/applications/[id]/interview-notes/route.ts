
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH: Atualizar notas da entrevista
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

    if (!user || (user.role !== 'company' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const data = await req.json();
    const { interviewNotes, attendedInterview } = data;

    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    if (user.role === 'company' && application.job.userId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: {
        ...(interviewNotes !== undefined && { interviewNotes }),
        ...(attendedInterview !== undefined && { attendedInterview }),
      },
    });

    return NextResponse.json({ application: updatedApplication });
  } catch (error: any) {
    console.error('Erro ao atualizar notas da entrevista:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar notas da entrevista' },
      { status: 500 }
    );
  }
}
