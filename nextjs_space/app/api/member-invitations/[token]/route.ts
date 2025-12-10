import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const acceptInvitationSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// GET - Verificar token e obter dados do convite
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await db.memberInvitation.findUnique({
      where: { token: params.token },
      include: {
        company: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Este convite já foi aceito' },
        { status: 400 }
      );
    }

    if (invitation.status === 'expired' || new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Este convite expirou' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        name: invitation.name,
        companyName: invitation.company.companyName,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao verificar convite:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar convite' },
      { status: 500 }
    );
  }
}

// POST - Aceitar convite e criar conta
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitation = await db.memberInvitation.findUnique({
      where: { token: params.token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Convite não encontrado' },
        { status: 404 }
      );
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Este convite já foi aceito' },
        { status: 400 }
      );
    }

    if (invitation.status === 'expired' || new Date() > invitation.expiresAt) {
      await db.memberInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      return NextResponse.json(
        { error: 'Este convite expirou' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = acceptInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // Verificar se já existe usuário com este e-mail
    const existingUser = await db.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este e-mail' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar CompanyUser (sub-usuário)
    const companyUser = await db.companyUser.create({
      data: {
        companyId: invitation.companyId,
        name: invitation.name,
        email: invitation.email,
        password: hashedPassword,
        groupId: invitation.groupId,
        permissionId: invitation.permissionId,
        isActive: true,
      },
    });

    // Marcar convite como aceito
    await db.memberInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    // Criar notificação para empresa
    await db.notification.create({
      data: {
        userId: invitation.companyId,
        type: 'system',
        title: 'Membro aceitou convite',
        message: `${invitation.name} aceitou o convite e agora faz parte da equipe`,
        link: '/dashboard/team',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Você já pode fazer login.',
    });
  } catch (error: any) {
    console.error('Erro ao aceitar convite:', error);
    return NextResponse.json(
      { error: 'Erro ao aceitar convite' },
      { status: 500 }
    );
  }
}
