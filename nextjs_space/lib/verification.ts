
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';

export async function generateVerificationToken(email: string) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

  // Delete any existing tokens for this email
  await db.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new token
  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyToken(token: string) {
  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return { success: false, message: 'Token inválido' };
  }

  if (verificationToken.expires < new Date()) {
    await db.verificationToken.delete({
      where: { token },
    });
    return { success: false, message: 'Token expirado' };
  }

  // Update user email verified
  await db.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete token
  await db.verificationToken.delete({
    where: { token },
  });

  return { success: true, message: 'Email verificado com sucesso!' };
}
