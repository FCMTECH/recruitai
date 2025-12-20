import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();

    if (secret !== process.env.MAINTENANCE_SECRET) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const existingSuperadmin = await db.user.findFirst({
      where: { role: 'superadmin' }
    });

    if (existingSuperadmin) {
      // Verificar email se necessário
      if (!existingSuperadmin.emailVerified) {
        await db.user.update({
          where: { id: existingSuperadmin.id },
          data: { emailVerified: new Date() }
        });
        return NextResponse.json({
          message: 'Superadmin já existe e foi verificado',
          admin: {
            email: existingSuperadmin.email,
            name: existingSuperadmin.name
          }
        });
      }
      
      return NextResponse.json({
        message: 'Superadmin já existe',
        admin: {
          email: existingSuperadmin.email,
          name: existingSuperadmin.name
        }
      });
    }

    const adminEmail = 'admin@recruitai.com.br';
    const adminPassword = 'Admin@2025';
    const adminName = 'Administrador';

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await db.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'superadmin',
        companyName: '',
        emailVerified: new Date()
      }
    });

    return NextResponse.json({
      message: 'Superadmin criado com sucesso',
      admin: {
        email: admin.email,
        name: admin.name
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
        warning: 'Altere a senha após o primeiro login!'
      }
    });

  } catch (error) {
    console.error('Erro ao garantir superadmin:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}