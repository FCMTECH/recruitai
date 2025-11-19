
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/users/[id]
 * Remove um administrador
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    if (userRole !== 'superadmin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Não permitir que o admin delete a si mesmo
    if (currentUserId === params.id) {
      return NextResponse.json(
        { error: 'Você não pode remover sua própria conta' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é admin
    const targetUser = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (targetUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Usuário não é um administrador' }, { status: 400 });
    }

    // Verificar se há pelo menos 2 admins
    const adminCount = await db.user.count({
      where: { role: 'superadmin' }
    });

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Não é possível remover o último administrador' },
        { status: 400 }
      );
    }

    // Remover o administrador
    await db.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Administrador removido com sucesso' });

  } catch (error) {
    console.error('Erro ao remover administrador:', error);
    return NextResponse.json(
      { error: 'Erro ao remover administrador' },
      { status: 500 }
    );
  }
}
