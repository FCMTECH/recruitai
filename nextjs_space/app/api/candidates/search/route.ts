
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar no banco de currículos da plataforma
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'company') {
      return NextResponse.json(
        { error: 'Apenas empresas podem acessar o banco de currículos' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const skillCategory = searchParams.get('skillCategory') || '';
    const degree = searchParams.get('degree') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Construir filtros dinâmicos
    const where: any = {};

    // Busca por nome ou email
    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Filtros de localização
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    // Filtros por habilidades
    if (skillCategory) {
      where.skills = {
        some: {
          category: { contains: skillCategory, mode: 'insensitive' },
        },
      };
    }

    // Filtros por formação
    if (degree) {
      where.education = {
        some: {
          degree: { contains: degree, mode: 'insensitive' },
        },
      };
    }

    // Buscar candidatos
    const [profiles, total] = await Promise.all([
      db.candidateProfile.findMany({
        where,
        include: {
          education: {
            orderBy: { startDate: 'desc' },
            take: 1,
          },
          experiences: {
            orderBy: { startDate: 'desc' },
            take: 2,
          },
          skills: {
            orderBy: { level: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      db.candidateProfile.count({ where }),
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar candidatos' },
      { status: 500 }
    );
  }
}
