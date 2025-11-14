
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar todas as certificações de um candidato
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

    const certifications = await db.certification.findMany({
      where: { candidateId },
      orderBy: { issueDate: 'desc' },
    });

    return NextResponse.json(certifications);
  } catch (error) {
    console.error('Erro ao buscar certificações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar certificações' },
      { status: 500 }
    );
  }
}

// POST: Adicionar nova certificação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidateId,
      name,
      issuingOrg,
      issueDate,
      expiryDate,
      credentialId,
      description,
    } = body;

    if (!candidateId || !name || !issuingOrg) {
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

    const certification = await db.certification.create({
      data: {
        candidateId,
        name,
        issuingOrg,
        issueDate: issueDate ? convertToDate(issueDate) : null,
        expiryDate: expiryDate ? convertToDate(expiryDate) : null,
        credentialId,
        description,
      },
    });

    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar certificação:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar certificação' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar certificação
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
    if (data.issueDate) data.issueDate = convertToDate(data.issueDate);
    if (data.expiryDate) data.expiryDate = convertToDate(data.expiryDate);

    const certification = await db.certification.update({
      where: { id },
      data,
    });

    return NextResponse.json(certification);
  } catch (error) {
    console.error('Erro ao atualizar certificação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar certificação' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir certificação
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

    await db.certification.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Certificação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir certificação:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir certificação' },
      { status: 500 }
    );
  }
}
