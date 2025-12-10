
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: any = {
      userId: session.user.id
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      take: 50 // Limit to last 50 notifications
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    });

    return NextResponse.json({
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notificações" },
      { status: 500 }
    );
  }
}

// POST - Create a new notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, link } = body;

    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      }
    });

    return NextResponse.json(notification);

  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Erro ao criar notificação" },
      { status: 500 }
    );
  }
}
