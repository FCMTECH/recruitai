
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar todas as habilidades de um candidato
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId é obrigatório' },
        { status: 400 }
      );
    }

    const skills = await db.skill.findMany({
      where: { candidateId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Erro ao buscar habilidades:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar habilidades' },
      { status: 500 }
    );
  }
}

// POST: Adicionar nova habilidade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, name, level, yearsOfExperience, category } = body;

    if (!candidateId || !name || !level) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    const skill = await db.skill.create({
      data: {
        candidateId,
        name,
        level,
        yearsOfExperience,
        category,
      },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar habilidade:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar habilidade' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar habilidade
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const skill = await db.skill.update({
      where: { id },
      data,
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Erro ao atualizar habilidade:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar habilidade' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir habilidade
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    await db.skill.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Habilidade excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir habilidade:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir habilidade' },
      { status: 500 }
    );
  }
}
