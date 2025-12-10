import { randomBytes } from 'crypto';
import { db } from '@/lib/db';

export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000);

  await db.passwordResetToken.deleteMany({
    where: { email }
  });

  await db.passwordResetToken.create({
    data: { email, token, expires }
  });

  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<{ success: boolean; message: string; email?: string }> {
  const resetToken = await db.passwordResetToken.findUnique({
    where: { token }
  });

  if (!resetToken) {
    return { success: false, message: 'Token inválido ou expirado' };
  }

  if (resetToken.expires < new Date()) {
    await db.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { success: false, message: 'Token expirado' };
  }

  return { success: true, message: 'Token válido', email: resetToken.email };
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await db.passwordResetToken.deleteMany({ where: { token } });
}
