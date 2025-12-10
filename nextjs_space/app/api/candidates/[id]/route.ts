
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar perfil completo do candidato por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'company') {
      return NextResponse.json(
        { error: 'Apenas empresas podem acessar perfis de candidatos' },
        { status: 403 }
      );
    }

    const profile = await db.candidateProfile.findUnique({
      where: { id: params.id },
      include: {
        education: {
          orderBy: { startDate: 'desc' },
        },
        experiences: {
          orderBy: { startDate: 'desc' },
        },
        skills: {
          orderBy: [
            { level: 'desc' },
            { name: 'asc' },
          ],
        },
        courses: {
          orderBy: { completionDate: 'desc' },
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
        _count: {
          select: {
            applications: true,
          },
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
