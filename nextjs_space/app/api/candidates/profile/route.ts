
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar perfil do candidato por email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const profile = await db.candidateProfile.findUnique({
      where: { email },
      include: {
        education: {
          orderBy: { startDate: 'desc' },
        },
        experiences: {
          orderBy: { startDate: 'desc' },
        },
        skills: {
          orderBy: { name: 'asc' },
        },
        courses: {
          orderBy: { completionDate: 'desc' },
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil do candidato' },
      { status: 500 }
    );
  }
}

// POST: Criar ou atualizar perfil completo do candidato
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      fullName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      country,
      linkedinUrl,
      portfolioUrl,
      githubUrl,
      summary,
      resumeUrl,
      photoUrl,
    } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email e nome completo são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar upsert para criar ou atualizar
    const profile = await db.candidateProfile.upsert({
      where: { email },
      update: {
        fullName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        city,
        state,
        zipCode,
        country,
        linkedinUrl,
        portfolioUrl,
        githubUrl,
        summary,
        resumeUrl,
        photoUrl,
      },
      create: {
        email,
        fullName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        city,
        state,
        zipCode,
        country: country || 'Brasil',
        linkedinUrl,
        portfolioUrl,
        githubUrl,
        summary,
        resumeUrl,
        photoUrl,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Erro ao criar/atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao criar/atualizar perfil do candidato' },
      { status: 500 }
    );
  }
}
