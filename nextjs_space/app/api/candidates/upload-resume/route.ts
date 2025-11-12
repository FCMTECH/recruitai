
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Configure S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
});

const bucketName = process.env.AWS_BUCKET_NAME || '';
const folderPrefix = process.env.AWS_FOLDER_PREFIX || '';

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
    const timestamp = Date.now();
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    const extension = file.name.split('.').pop();
    const s3Key = `${folderPrefix}resumes/${sanitizedEmail}_${timestamp}.${extension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedBy: email,
        uploadedAt: new Date().toISOString(),
      },
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Update candidate profile with resume URL
    await db.candidateProfile.upsert({
      where: { email },
      update: {
        resumeUrl: s3Key,
      },
      create: {
        email,
        fullName: '',
        resumeUrl: s3Key,
      },
    });

    return NextResponse.json({
      message: 'Currículo enviado com sucesso',
      resumeUrl: s3Key,
    });
  } catch (error) {
    console.error('Erro ao fazer upload do currículo:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload do currículo' },
      { status: 500 }
    );
  }
}
