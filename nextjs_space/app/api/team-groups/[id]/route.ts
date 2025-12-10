
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const groupUpdateSchema = z.object({
  name: z.string().min(1, "Nome do grupo é obrigatório").optional(),
  description: z.string().optional(),
  color: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "company" && userRole !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const group = await db.teamGroup.findUnique({
      where: {
        id: params.id
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Verificar se o grupo pertence à empresa
    if (userRole === "company" && group.companyId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Team group GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "company") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const group = await db.teamGroup.findUnique({
      where: { id: params.id }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.companyId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = groupUpdateSchema.parse(body);

    const updatedGroup = await db.teamGroup.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Team group PATCH error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "company") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const group = await db.teamGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.companyId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Deletar grupo (os membros ficam sem grupo devido ao onDelete: SetNull)
    await db.teamGroup.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: "Grupo deletado com sucesso" });
  } catch (error) {
    console.error("Team group DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
