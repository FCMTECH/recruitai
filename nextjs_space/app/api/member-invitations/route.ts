import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { sendEmail, emailTemplates } from '@/lib/email';

export const dynamic = 'force-dynamic';

const createInvitationSchema = z.object({
  email: z.string().email('E-mail inválido'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  groupId: z.string().optional(),
  permissionId: z.string().optional(),
});

// POST - Criar convite para membro
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;
    const userEmail = (session.user as any)?.email;

    if (userRole !== 'company') {
      return NextResponse.json(
        { error: 'Apenas empresas podem convidar membros' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, name, groupId, permissionId } = validation.data;

    // Validar domínio do e-mail (deve ser do mesmo domínio da empresa)
    const userDomain = userEmail.split('@')[1];
    const inviteDomain = email.split('@')[1];

    if (userDomain !== inviteDomain) {
      return NextResponse.json(
        { error: 'O e-mail do membro deve ser do mesmo domínio da empresa' },
        { status: 400 }
      );
    }

    // Verificar se já existe usuário com este e-mail
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este e-mail' },
        { status: 400 }
      );
    }

    // Verificar se já existe convite pendente
    const existingInvitation = await db.memberInvitation.findFirst({
      where: {
        email,
        status: 'pending',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Já existe um convite pendente para este e-mail' },
        { status: 400 }
      );
    }

    // Verificar limite de membros
    const subscription = await db.subscription.findFirst({
      where: {
        userId: userId,
        status: {
          in: ['active', 'trial'],
        },
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada ou inativa' },
        { status: 400 }
      );
    }

    const currentMembersCount = await db.companyUser.count({
      where: {
        companyId: userId,
        isActive: true,
      },
    });

    if (currentMembersCount >= subscription.plan.memberLimit) {
      return NextResponse.json(
        { error: `Limite de membros atingido (${subscription.plan.memberLimit})` },
        { status: 400 }
      );
    }

    // Gerar token único
    const token = randomBytes(32).toString('hex');
    
    // Data de expiração: 7 dias
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Criar convite
    const invitation = await db.memberInvitation.create({
      data: {
        companyId: userId,
        email,
        name,
        groupId: groupId || null,
        permissionId: permissionId || null,
        token,
        status: 'pending',
        expiresAt,
      },
    });

    // Enviar e-mail de convite
    const inviteLink = `${process.env.NEXTAUTH_URL}/member-invite/${token}`;
    const company = await db.user.findUnique({
      where: { id: userId },
      select: { companyName: true },
    });

    try {
      await sendEmail({
        to: email,
        subject: `Convite para ${company?.companyName || 'equipe'}`,
        html: `
          <h2>Você foi convidado!</h2>
          <p>Olá ${name},</p>
          <p>Você foi convidado para fazer parte da equipe de <strong>${company?.companyName}</strong> na plataforma RecruitAI.</p>
          <p>Para aceitar o convite e criar sua conta, clique no link abaixo:</p>
          <p><a href="${inviteLink}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Aceitar Convite</a></p>
          <p>Este convite expira em 7 dias.</p>
          <p>Se você não solicitou este convite, ignore este e-mail.</p>
        `,
        text: `Você foi convidado para ${company?.companyName}. Aceite o convite em: ${inviteLink}`,
      });
    } catch (emailError) {
      console.error('Erro ao enviar e-mail:', emailError);
      // Não falhamos a operação se o e-mail falhar
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
      message: 'Convite enviado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao criar convite:', error);
    return NextResponse.json(
      { error: 'Erro ao criar convite' },
      { status: 500 }
    );
  }
}
