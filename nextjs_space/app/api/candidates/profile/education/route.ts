
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar todas as formações de um candidato
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

    const education = await db.education.findMany({
      where: { candidateId },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error('Erro ao buscar formações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar formações' },
      { status: 500 }
    );
  }
}

// POST: Adicionar nova formação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidateId,
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      isCurrent,
      description,
    } = body;

    if (!candidateId || !institution || !degree || !fieldOfStudy) {
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

    const education = await db.education.create({
      data: {
        candidateId,
        institution,
        degree,
        fieldOfStudy,
        startDate: startDate ? convertToDate(startDate)! : new Date(),
        endDate: endDate ? convertToDate(endDate) : null,
        isCurrent: isCurrent || false,
        description,
      },
    });

    return NextResponse.json(education, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar formação:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar formação' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar formação
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

    const education = await db.education.update({
      where: { id },
      data,
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error('Erro ao atualizar formação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar formação' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir formação
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

    await db.education.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Formação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir formação:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir formação' },
      { status: 500 }
    );
  }
}
