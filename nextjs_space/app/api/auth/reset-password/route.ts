import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken, deletePasswordResetToken } from '@/lib/password-reset';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Token e senha obrigatórios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Senha deve ter 6+ caracteres' }, { status: 400 });
    }

    const verification = await verifyPasswordResetToken(token);

    if (!verification.success || !verification.email) {
      return NextResponse.json({ message: verification.message }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { email: verification.email },
      data: { password: hashedPassword }
    });

    await deletePasswordResetToken(token);

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error: any) {
    console.error('Erro reset-password:', error);
    return NextResponse.json({ message: 'Erro ao redefinir senha' }, { status: 500 });
  }
}
