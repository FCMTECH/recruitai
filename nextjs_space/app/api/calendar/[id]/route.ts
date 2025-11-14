
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Buscar evento específico
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

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const event = await db.calendarEvent.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar evento
export async function PATCH(
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

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const data = await req.json();
    
    const event = await db.calendarEvent.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    const updatedEvent = await db.calendarEvent.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.eventType && { eventType: data.eventType }),
        ...(data.startDateTime && { startDateTime: new Date(data.startDateTime) }),
        ...(data.endDateTime && { endDateTime: new Date(data.endDateTime) }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.attendees && { attendees: data.attendees }),
        ...(data.isAllDay !== undefined && { isAllDay: data.isAllDay }),
        ...(data.reminderMinutes !== undefined && { reminderMinutes: data.reminderMinutes }),
        ...(data.jobId !== undefined && { jobId: data.jobId }),
        ...(data.applicationId !== undefined && { applicationId: data.applicationId }),
      },
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error: any) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    );
  }
}

// DELETE: Remover evento
export async function DELETE(
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

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const event = await db.calendarEvent.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
    }

    await db.calendarEvent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Evento removido com sucesso' });
  } catch (error: any) {
    console.error('Erro ao remover evento:', error);
    return NextResponse.json(
      { error: 'Erro ao remover evento' },
      { status: 500 }
    );
  }
}
