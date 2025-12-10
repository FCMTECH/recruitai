
import { NextRequest, NextResponse } from 'next/server';
import { generateVerificationToken } from '@/lib/verification';
import { sendEmail, emailTemplates } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const token = await generateVerificationToken(email);
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verificação de Email - RecruitAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bem-vindo ao RecruitAI!</h2>
          <p>Por favor, clique no link abaixo para verificar seu email:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verificar Email
          </a>
          <p>Este link expira em 24 horas.</p>
          <p>Se você não criou uma conta no RecruitAI, ignore este email.</p>
        </div>
      `,
      text: `Bem-vindo ao RecruitAI! Por favor, verifique seu email clicando neste link: ${verificationUrl}. Este link expira em 24 horas.`,
    });

    return NextResponse.json({
      message: 'Email de verificação enviado com sucesso!',
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email de verificação' },
      { status: 500 }
    );
  }
}
