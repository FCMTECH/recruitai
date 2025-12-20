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

    console.log('🔧 Verificando superadmin...');

    const existingSuperadmin = await db.user.findFirst({
      where: { role: 'superadmin' }
    });

    if (existingSuperadmin) {
      console.log(`✅ Superadmin já existe: ${existingSuperadmin.email}`);
      
      // Verificar email se necessário
      if (!existingSuperadmin.emailVerified) {
        await db.user.update({
          where: { id: existingSuperadmin.id },
          data: { emailVerified: new Date() }
        });
        console.log('✅ Email do superadmin verificado');
        return NextResponse.json({
          success: true,
          message: 'Superadmin já existe e foi verificado',
          admin: {
            id: existingSuperadmin.id,
            email: existingSuperadmin.email,
            name: existingSuperadmin.name,
            emailVerified: true
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Superadmin já existe',
        admin: {
          id: existingSuperadmin.id,
          email: existingSuperadmin.email,
          name: existingSuperadmin.name,
          emailVerified: !!existingSuperadmin.emailVerified
        }
      });
    }

    console.log('🔨 Criando novo superadmin...');

    const adminEmail = 'admin@recruitai.com.br';
    const adminPassword = 'Admin@2025';
    const adminName = 'Administrador RecruitAI';

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

    console.log(`✅ Superadmin criado: ${admin.email}`);

    return NextResponse.json({
      success: true,
      message: 'Superadmin criado com sucesso',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        emailVerified: true
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
        warning: '⚠️ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao garantir superadmin:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao processar solicitação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}