
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET: Listar usuários da empresa
export async function GET(req: NextRequest) {
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

    const companyUsers = await db.companyUser.findMany({
      where: { companyId: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        groupId: true,
        permissionId: true,
        group: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        permission: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users: companyUsers });
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

// POST: Criar novo usuário da empresa
export async function POST(req: NextRequest) {
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

    // Verificar limite de membros baseado no plano
    const subscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ['trial', 'active', 'grace_period']
        }
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Você precisa de uma assinatura ativa para adicionar membros' },
        { status: 403 }
      );
    }

    // Contar membros atuais
    const currentMemberCount = await db.companyUser.count({
      where: {
        companyId: user.id,
        isActive: true
      }
    });

    if (currentMemberCount >= subscription.plan.memberLimit) {
      return NextResponse.json(
        { 
          error: `Limite de membros atingido. Seu plano ${subscription.plan.displayName} permite até ${subscription.plan.memberLimit} membro(s). Faça upgrade para adicionar mais membros.`,
          limit: subscription.plan.memberLimit,
          current: currentMemberCount
        },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { name, email, password, role, groupId, permissionId } = data;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar domínio do email
    const companyDomain = user.email.split('@')[1];
    const memberDomain = email.split('@')[1];

    if (companyDomain !== memberDomain) {
      return NextResponse.json(
        { 
          error: `O domínio do email deve ser @${companyDomain}. Todos os membros devem usar o mesmo domínio da empresa.`,
          expectedDomain: companyDomain
        },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await db.companyUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.companyUser.create({
      data: {
        companyId: user.id,
        name,
        email,
        password: hashedPassword,
        role: role || 'member',
        groupId: groupId || null,
        permissionId: permissionId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        groupId: true,
        permissionId: true,
        group: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        permission: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
      },
    });

    // Tentar criar notificação para o novo usuário (não crítico)
    try {
      await db.companyUserNotification.create({
        data: {
          companyUserId: newUser.id,
          type: 'system',
          title: 'Bem-vindo ao RecruitAI',
          message: `Sua conta foi criada com sucesso! Faça login com o email: ${email}`,
        },
      });
    } catch (notifError) {
      console.error('Erro ao criar notificação (não crítico):', notifError);
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
