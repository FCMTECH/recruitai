
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: Buscar usuário específico
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

    if (!user || user.role !== 'company') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const companyUser = await db.companyUser.findFirst({
      where: {
        id: params.id,
        companyId: user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!companyUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user: companyUser });
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar usuário
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

    if (!user || user.role !== 'company') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const data = await req.json();
    
    const companyUser = await db.companyUser.findFirst({
      where: {
        id: params.id,
        companyId: user.id,
      },
    });

    if (!companyUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) {
      // Verificar se o novo email já está em uso
      const existingUser = await db.companyUser.findFirst({
        where: {
          email: data.email,
          NOT: { id: params.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 400 }
        );
      }

      updateData.email = data.email;
    }
    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.groupId !== undefined) updateData.groupId = data.groupId;

    const updatedUser = await db.companyUser.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// DELETE: Remover usuário
export async function DELETE(
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

    if (!user || user.role !== 'company') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const companyUser = await db.companyUser.findFirst({
      where: {
        id: params.id,
        companyId: user.id,
      },
    });

    if (!companyUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    await db.companyUser.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Usuário removido com sucesso' });
  } catch (error: any) {
    console.error('Erro ao remover usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao remover usuário' },
      { status: 500 }
    );
  }
}
