import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createTicketSchema = z.object({
  subject: z.string().min(5, 'Assunto deve ter no mínimo 5 caracteres'),
  message: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// GET - Listar tickets (empresa vê seus tickets, admin vê todos)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');

    let where: any = {};

    // Super admin vê todos os tickets
    if (userRole === 'superadmin') {
      if (status && status !== 'all') {
        where.status = status;
      }
      if (companyId) {
        where.companyId = companyId;
      }
    } else if (userRole === 'company') {
      // Empresa vê apenas seus tickets
      where.companyId = userId;
      if (status && status !== 'all') {
        where.status = status;
      }
    } else {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const tickets = await db.supportTicket.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error('Erro ao listar tickets:', error);
    return NextResponse.json(
      { error: 'Erro ao listar tickets' },
      { status: 500 }
    );
  }
}

// POST - Criar novo ticket (apenas empresa)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (userRole !== 'company') {
      return NextResponse.json(
        { error: 'Apenas empresas podem abrir chamados' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createTicketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { subject, message, priority } = validation.data;

    // Criar ticket e primeira mensagem
    const ticket = await db.supportTicket.create({
      data: {
        companyId: userId,
        userId: userId,
        subject,
        status: 'open',
        priority: priority || 'medium',
      },
      include: {
        company: {
          select: {
            companyName: true,
            email: true,
          },
        },
      },
    });

    // Criar primeira mensagem
    await db.supportMessage.create({
      data: {
        ticketId: ticket.id,
        userId: userId,
        message,
        isAdmin: false,
      },
    });

    // Criar notificação para admins
    const admins = await db.user.findMany({
      where: { role: 'superadmin' },
      select: { id: true },
    });

    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: 'system',
          title: 'Novo chamado de suporte',
          message: `${ticket.company.companyName} abriu um chamado: ${subject}`,
          link: `/admin/support/${ticket.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      ticket,
      message: 'Chamado criado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao criar ticket:', error);
    return NextResponse.json(
      { error: 'Erro ao criar ticket' },
      { status: 500 }
    );
  }
}
