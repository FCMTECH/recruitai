
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const permissionSchema = z.object({
  name: z.string().min(1).optional(),
  canViewAllJobs: z.boolean().optional(),
  canViewOwnGroupJobs: z.boolean().optional(),
  canViewAllProfiles: z.boolean().optional(),
  canViewAllApplications: z.boolean().optional(),
  canViewOwnApplications: z.boolean().optional(),
  canViewTeamMembers: z.boolean().optional(),
  canViewAllGroups: z.boolean().optional(),
  canViewOwnGroup: z.boolean().optional(),
  canCreateJobs: z.boolean().optional(),
  canEditJobs: z.boolean().optional(),
  canDeleteJobs: z.boolean().optional(),
  canManageApplications: z.boolean().optional(),
  canHireCandidates: z.boolean().optional(),
  canInviteInterviews: z.boolean().optional(),
  canManageTeam: z.boolean().optional(),
  canManageGroups: z.boolean().optional(),
  canAccessReports: z.boolean().optional(),
});

/**
 * GET /api/permissions/[id]
 * Busca um perfil de permissão específico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;
    
    const permission = await db.memberPermission.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    if (!permission) {
      return NextResponse.json({ error: 'Permissão não encontrada' }, { status: 404 });
    }

    // Verificar se pertence à empresa
    if (userRole === 'company' && permission.companyId !== userId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json(permission);

  } catch (error) {
    console.error('Erro ao buscar permissão:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar permissão' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/permissions/[id]
 * Atualiza um perfil de permissão
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (userRole !== 'company') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar propriedade
    const existingPermission = await db.memberPermission.findUnique({
      where: { id: params.id }
    });

    if (!existingPermission) {
      return NextResponse.json({ error: 'Permissão não encontrada' }, { status: 404 });
    }

    if (existingPermission.companyId !== userId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = permissionSchema.parse(body);

    const updatedPermission = await db.memberPermission.update({
      where: { id: params.id },
      data: validatedData
    });

    return NextResponse.json(updatedPermission);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao atualizar permissão:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar permissão' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/permissions/[id]
 * Remove um perfil de permissão
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
    const userId = (session.user as any)?.id;

    if (userRole !== 'company') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar propriedade
    const existingPermission = await db.memberPermission.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    if (!existingPermission) {
      return NextResponse.json({ error: 'Permissão não encontrada' }, { status: 404 });
    }

    if (existingPermission.companyId !== userId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Verificar se há membros usando esta permissão
    if (existingPermission._count.members > 0) {
      return NextResponse.json(
        { error: `Não é possível remover. Existem ${existingPermission._count.members} membro(s) com esta permissão.` },
        { status: 400 }
      );
    }

    await db.memberPermission.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Permissão removida com sucesso' });

  } catch (error) {
    console.error('Erro ao remover permissão:', error);
    return NextResponse.json(
      { error: 'Erro ao remover permissão' },
      { status: 500 }
    );
  }
}
