
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar todos os cursos de um candidato
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

    const courses = await db.course.findMany({
      where: { candidateId },
      orderBy: { completionDate: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cursos' },
      { status: 500 }
    );
  }
}

// POST: Adicionar novo curso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidateId,
      name,
      institution,
      completionDate,
      hours,
      description,
    } = body;

    if (!candidateId || !name || !institution) {
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

    const course = await db.course.create({
      data: {
        candidateId,
        name,
        institution,
        completionDate: convertToDate(completionDate),
        hours,
        description,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar curso:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar curso' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar curso
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

    // Converter data se existir
    if (data.completionDate) data.completionDate = convertToDate(data.completionDate);

    const course = await db.course.update({
      where: { id },
      data,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar curso' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir curso
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

    await db.course.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Curso excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir curso' },
      { status: 500 }
    );
  }
}
