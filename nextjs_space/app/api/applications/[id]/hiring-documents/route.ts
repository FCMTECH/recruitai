
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH: Atualizar documentos e checklist de contratação
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
    const { hiringDocuments, admissionChecklist } = data;

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

    if (!application.isHired) {
      return NextResponse.json(
        { error: 'Candidato ainda não foi contratado' },
        { status: 400 }
      );
    }

    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: {
        ...(hiringDocuments !== undefined && { hiringDocuments }),
        ...(admissionChecklist !== undefined && { admissionChecklist }),
      },
    });

    return NextResponse.json({ application: updatedApplication });
  } catch (error: any) {
    console.error('Erro ao atualizar documentos de contratação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar documentos de contratação' },
      { status: 500 }
    );
  }
}

// GET: Buscar documentos de contratação
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

    if (!user || (user.role !== 'company' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const application = await db.application.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        candidateName: true,
        candidateEmail: true,
        isHired: true,
        hiredAt: true,
        hiringDocuments: true,
        admissionChecklist: true,
        job: {
          select: {
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    if (user.role === 'company' && application.job.userId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error('Erro ao buscar documentos de contratação:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar documentos de contratação' },
      { status: 500 }
    );
  }
}
