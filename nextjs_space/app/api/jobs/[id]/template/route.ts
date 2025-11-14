
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Gerar template de divulgação
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== 'company' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const job = await db.job.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    if (user.role === 'company' && job.userId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Gerar template personalizado
    const template = generateJobTemplate(job);

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Erro ao gerar template:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar template' },
      { status: 500 }
    );
  }
}

// POST: Salvar template personalizado
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== 'company' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const data = await req.json();
    const { template } = data;

    if (!template) {
      return NextResponse.json(
        { error: 'Template é obrigatório' },
        { status: 400 }
      );
    }

    const job = await db.job.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    if (user.role === 'company' && job.userId !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const updatedJob = await db.job.update({
      where: { id: params.id },
      data: {
        publicationTemplate: template,
      },
    });

    return NextResponse.json({ job: updatedJob });
  } catch (error: any) {
    console.error('Erro ao salvar template:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar template' },
      { status: 500 }
    );
  }
}

function generateJobTemplate(job: any): string {
  const location = job.city && job.state && job.country 
    ? `${job.city}, ${job.state} - ${job.country}`
    : job.location || 'A definir';

  const jobType = job.type || 'Tempo integral';
  const companyName = job.user?.companyName || job.companyName || 'Nossa Empresa';

  return `🚀 NOVA VAGA ABERTA! 

📌 Vaga: ${job.title}
🏢 Empresa: ${companyName}
📍 Local: ${location}
⏰ Tipo: ${jobType}

📝 Sobre a vaga:
${job.description}

${job.requirements ? `✅ Requisitos:\n${job.requirements}\n\n` : ''}🔗 Candidate-se agora através do nosso site!

#Vagas #Emprego #Oportunidades #${job.title.replace(/\s+/g, '')} #RecruitAI`;
}
