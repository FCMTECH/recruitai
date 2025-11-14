
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar eventos do calendário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const whereClause: any = {
      userId: user.id,
    };

    if (startDate && endDate) {
      whereClause.startDateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await db.calendarEvent.findMany({
      where: whereClause,
      orderBy: { startDateTime: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    );
  }
}

// POST: Criar novo evento
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const data = await req.json();
    const {
      title,
      description,
      eventType,
      startDateTime,
      endDateTime,
      location,
      attendees,
      isAllDay,
      reminderMinutes,
      jobId,
      applicationId,
    } = data;

    if (!title || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Título, data de início e fim são obrigatórios' },
        { status: 400 }
      );
    }

    const event = await db.calendarEvent.create({
      data: {
        userId: user.id,
        title,
        description,
        eventType: eventType || 'meeting',
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        location,
        attendees: attendees || [],
        isAllDay: isAllDay || false,
        reminderMinutes,
        jobId,
        applicationId,
      },
    });

    // Criar notificação se tiver reminder
    if (reminderMinutes) {
      const reminderDate = new Date(new Date(startDateTime).getTime() - reminderMinutes * 60000);
      
      // Criar notificação
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'event_reminder',
          title: `Lembrete: ${title}`,
          message: `Você tem um evento agendado para ${new Date(startDateTime).toLocaleString('pt-BR')}`,
          link: `/dashboard/agenda?event=${event.id}`,
        },
      });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    );
  }
}
