
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const permissionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
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
 * GET /api/permissions
 * Lista todos os perfis de permissão da empresa
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'company' && userRole !== 'superadmin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const userId = (session.user as any)?.id;

    const permissions = await db.memberPermission.findMany({
      where: {
        companyId: userId
      },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(permissions);

  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar permissões' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/permissions
 * Cria um novo perfil de permissão
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'company') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const userId = (session.user as any)?.id;
    const body = await req.json();
    
    const validatedData = permissionSchema.parse(body);

    const newPermission = await db.memberPermission.create({
      data: {
        companyId: userId,
        ...validatedData
      }
    });

    return NextResponse.json(newPermission, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar permissão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar permissão' },
      { status: 500 }
    );
  }
}
