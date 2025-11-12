
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar perfil completo de um candidato específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Permitir que empresas e superadmin acessem
    if (session.user.role !== 'company' && session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const candidateId = params.id;

    const profile = await db.candidateProfile.findUnique({
      where: { id: candidateId },
      include: {
        education: {
          orderBy: { startDate: 'desc' },
        },
        experiences: {
          orderBy: { startDate: 'desc' },
        },
        skills: {
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        },
        courses: {
          orderBy: { completionDate: 'desc' },
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil do candidato:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil do candidato' },
      { status: 500 }
    );
  }
}
