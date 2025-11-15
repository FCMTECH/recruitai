
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'company') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP' 
      }, { status: 400 });
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 5MB' 
      }, { status: 400 });
    }

    // Converter arquivo para buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const sanitizedEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = file.name.split('.').pop();
    const fileName = `logos/${sanitizedEmail}_${timestamp}.${extension}`;

    // Upload para S3
    const logoUrl = await uploadFile(buffer, fileName);

    // Atualizar usuário no banco de dados
    await db.user.update({
      where: { email: session.user.email },
      data: { logoUrl }
    });

    return NextResponse.json({ logoUrl }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    return NextResponse.json({ 
      error: 'Erro ao fazer upload do logo' 
    }, { status: 500 });
  }
}
