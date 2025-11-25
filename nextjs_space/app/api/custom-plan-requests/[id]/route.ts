import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["pending", "contacted", "converted", "rejected"]).optional(),
  notes: z.string().optional(),
});

// GET - Get a specific custom plan request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const customPlanRequest = await db.customPlanRequest.findUnique({
      where: { id: params.id },
    });

    if (!customPlanRequest) {
      return NextResponse.json(
        { error: "Solicitação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(customPlanRequest);
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar solicitação" },
      { status: 500 }
    );
  }
}

// PATCH - Update a custom plan request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    const customPlanRequest = await db.customPlanRequest.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(customPlanRequest);
  } catch (error) {
    console.error("Erro ao atualizar solicitação:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar solicitação" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a custom plan request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    await db.customPlanRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar solicitação:", error);
    return NextResponse.json(
      { error: "Erro ao deletar solicitação" },
      { status: 500 }
    );
  }
}
