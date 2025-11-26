import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting_company', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const addMessageSchema = z.object({
  message: z.string().min(1, 'Mensagem não pode estar vazia'),
});

// GET - Obter detalhes do ticket com todas as mensagens
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
    }

    // Verificar permissões
    if (userRole !== 'superadmin' && ticket.companyId !== userId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error('Erro ao buscar ticket:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ticket' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar status/prioridade do ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
    }

    // Verificar permissões
    if (userRole !== 'superadmin' && ticket.companyId !== userId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateTicketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData: any = {
      ...validation.data,
    };

    // Se estiver fechando o ticket
    if (validation.data.status === 'closed' && ticket.status !== 'closed') {
      updateData.closedAt = new Date();
    }

    const updatedTicket = await db.supportTicket.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar ticket:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar ticket' },
      { status: 500 }
    );
  }
}

// POST - Adicionar mensagem ao ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
    }

    // Verificar permissões
    if (userRole !== 'superadmin' && ticket.companyId !== userId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const validation = addMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { message } = validation.data;
    const isAdmin = userRole === 'superadmin';

    // Criar mensagem
    const newMessage = await db.supportMessage.create({
      data: {
        ticketId: params.id,
        userId: userId,
        message,
        isAdmin,
      },
    });

    // Atualizar timestamp do ticket
    await db.supportTicket.update({
      where: { id: params.id },
      data: {
        updatedAt: new Date(),
        // Se admin respondeu, mudar status para "waiting_company"
        ...(isAdmin && ticket.status === 'open' ? { status: 'waiting_company' } : {}),
      },
    });

    // Criar notificação
    if (isAdmin) {
      // Notificar empresa
      await db.notification.create({
        data: {
          userId: ticket.companyId,
          type: 'system',
          title: 'Nova resposta no chamado',
          message: `Suporte respondeu seu chamado: ${ticket.subject}`,
          link: `/dashboard/support/${ticket.id}`,
        },
      });
    } else {
      // Notificar admins
      const admins = await db.user.findMany({
        where: { role: 'superadmin' },
        select: { id: true },
      });

      for (const admin of admins) {
        await db.notification.create({
          data: {
            userId: admin.id,
            type: 'system',
            title: 'Nova mensagem no chamado',
            message: `${ticket.company.companyName} respondeu o chamado: ${ticket.subject}`,
            link: `/admin/support/${ticket.id}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    console.error('Erro ao adicionar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar mensagem' },
      { status: 500 }
    );
  }
}
