import { NextRequest, NextResponse } from 'next/server';
import { generatePasswordResetToken } from '@/lib/password-reset';
import { sendEmail } from '@/lib/email';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email é obrigatório' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Se o email existir, você receberá um link.' });
    }

    const token = await generatePasswordResetToken(email);
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Redefinição de Senha - RecruitAI',
      html: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;"><h1>Redefinição de Senha</h1></div><div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;"><p>Olá,</p><p>Recebemos uma solicitação para redefinir sua senha.</p><div style="text-align: center; margin: 20px 0;"><a href="${resetUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Redefinir Senha</a></div><p>Ou copie este link:</p><p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p><div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;"><strong>Este link expira em 1 hora.</strong></div></div></div>`,
      text: `Redefinição de Senha\n\nClique no link: ${resetUrl}\n\nExpira em 1 hora.`
    });

    return NextResponse.json({ message: 'Se o email existir, você receberá um link.' });
  } catch (error: any) {
    console.error('Erro forgot-password:', error);
    return NextResponse.json({ message: 'Erro ao processar' }, { status: 500 });
  }
}
