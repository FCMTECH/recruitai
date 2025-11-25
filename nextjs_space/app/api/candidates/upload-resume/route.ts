
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const email = formData.get('email') as string;

    if (!file || !email) {
      return NextResponse.json(
        { error: 'Arquivo e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF ou DOC/DOCX são permitidos' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'O arquivo deve ter no máximo 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = file.name.split('.').pop();
    const fileName = `${sanitizedEmail}_${Date.now()}.${extension}`;

    // Upload to S3 using the centralized function
    const cloud_storage_path = await uploadFile(buffer, fileName);

    // Update candidate profile with resume URL
    await db.candidateProfile.upsert({
      where: { email },
      update: {
        resumeUrl: cloud_storage_path,
      },
      create: {
        email,
        fullName: '',
        resumeUrl: cloud_storage_path,
      },
    });

    return NextResponse.json({
      message: 'Currículo enviado com sucesso',
      resumeUrl: cloud_storage_path,
    });
  } catch (error) {
    console.error('Erro ao fazer upload do currículo:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload do currículo' },
      { status: 500 }
    );
  }
}
