import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Verificar autenticação
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  const validToken = process.env.MAINTENANCE_SECRET;

  if (!validToken) {
    console.error("MAINTENANCE_SECRET não configurado");
    return false;
  }

  return token === validToken;
}

// GET - Obter logs de manutenção
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { error: "Não autorizado. Token de manutenção inválido." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const logs = await db.maintenanceLog.findMany({
      where,
      orderBy: { executedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Erro ao obter logs de manutenção:", error);
    return NextResponse.json(
      {
        error: "Erro ao obter logs de manutenção",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
