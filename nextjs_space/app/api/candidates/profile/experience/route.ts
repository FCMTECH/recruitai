
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar todas as experiências de um candidato
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

    const experiences = await db.experience.findMany({
      where: { candidateId },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(experiences);
  } catch (error) {
    console.error('Erro ao buscar experiências:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar experiências' },
      { status: 500 }
    );
  }
}

// POST: Adicionar nova experiência
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidateId,
      company,
      position,
      jobType,
      location,
      startDate,
      endDate,
      isCurrent,
      description,
      achievements,
    } = body;

    if (!candidateId || !company || !position) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Helper function to convert YYYY-MM format to Date
    const convertToDate = (dateStr: string | undefined | null) => {
      if (!dateStr) return null;
      // If format is YYYY-MM, add -01 to make it a valid date
      if (dateStr.match(/^\d{4}-\d{2}$/)) {
        return new Date(dateStr + '-01');
      }
      return new Date(dateStr);
    };

    const experience = await db.experience.create({
      data: {
        candidateId,
        company,
        position,
        jobType,
        location,
        startDate: startDate ? convertToDate(startDate) : null,
        endDate: endDate ? convertToDate(endDate) : null,
        isCurrent: isCurrent || false,
        description,
        achievements,
      },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar experiência:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar experiência' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar experiência
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

    // Helper function to convert YYYY-MM format to Date
    const convertToDate = (dateStr: string | undefined | null) => {
      if (!dateStr) return null;
      // If format is YYYY-MM, add -01 to make it a valid date
      if (dateStr.match(/^\d{4}-\d{2}$/)) {
        return new Date(dateStr + '-01');
      }
      return new Date(dateStr);
    };

    // Converter datas se existirem
    if (data.startDate) data.startDate = convertToDate(data.startDate);
    if (data.endDate) data.endDate = convertToDate(data.endDate);

    const experience = await db.experience.update({
      where: { id },
      data,
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error('Erro ao atualizar experiência:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar experiência' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir experiência
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

    await db.experience.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Experiência excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir experiência:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir experiência' },
      { status: 500 }
    );
  }
}
