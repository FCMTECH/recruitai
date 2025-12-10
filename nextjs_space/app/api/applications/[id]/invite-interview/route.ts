
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendEmail, emailTemplates } from '@/lib/email';

export const dynamic = 'force-dynamic';

// POST: Convidar candidato para entrevista
export async function POST(
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

    if (!user || (user.role !== 'company' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const data = await req.json();
    const { interviewLink, interviewDate, message } = data;

    if (!interviewLink) {
      return NextResponse.json(
        { error: 'Link de agendamento é obrigatório' },
        { status: 400 }
      );
    }

    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Candidatura não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    if (user.role === 'company' && application.job.userId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Atualizar candidatura
    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: {
        invitedForInterview: true,
        invitedAt: new Date(),
        interviewLink,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        status: 'approved',
      },
    });

    // Enviar email para o candidato
    const emailData = {
      candidateName: application.candidateName,
      jobTitle: application.job.title,
      companyName: application.job.user?.companyName || 'Empresa',
      interviewLink,
      interviewDate: interviewDate ? new Date(interviewDate).toLocaleString('pt-BR') : 'A definir',
      customMessage: message || '',
    };

    await sendEmail({
      to: application.candidateEmail,
      subject: `Convite para Entrevista - ${application.job.title}`,
      html: `
        <h2>Olá ${emailData.candidateName}!</h2>
        <p>Temos uma ótima notícia! Você foi selecionado(a) para a próxima etapa do processo seletivo para a vaga de <strong>${emailData.jobTitle}</strong> na <strong>${emailData.companyName}</strong>.</p>
        ${emailData.customMessage ? `<p>${emailData.customMessage}</p>` : ''}
        <p><strong>Link para agendamento:</strong> <a href="${emailData.interviewLink}">${emailData.interviewLink}</a></p>
        ${interviewDate ? `<p><strong>Data e hora:</strong> ${emailData.interviewDate}</p>` : ''}
        <p>Boa sorte!</p>
      `,
      text: `Olá ${emailData.candidateName}! Você foi selecionado para a próxima etapa do processo seletivo para a vaga de ${emailData.jobTitle}. Link: ${emailData.interviewLink}`,
    });

    // Criar notificação para o candidato (se tiver perfil)
    if (application.candidateProfileId) {
      const candidateProfile = await db.candidateProfile.findUnique({
        where: { id: application.candidateProfileId },
      });

      if (candidateProfile) {
        const candidateUser = await db.user.findUnique({
          where: { email: candidateProfile.email },
        });

        if (candidateUser) {
          await db.notification.create({
            data: {
              userId: candidateUser.id,
              type: 'interview_invite',
              title: 'Convite para Entrevista',
              message: `Você foi convidado para entrevista da vaga: ${application.job.title}`,
              link: `/candidate/dashboard`,
            },
          });
        }
      }
    }

    return NextResponse.json({ application: updatedApplication });
  } catch (error: any) {
    console.error('Erro ao convidar para entrevista:', error);
    return NextResponse.json(
      { error: 'Erro ao convidar para entrevista' },
      { status: 500 }
    );
  }
}
