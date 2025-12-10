
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const application = await db.application.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        compatibilityScore: true,
        classification: true
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: "Candidatura não encontrada" },
        { status: 404 }
      );
    }

    const isAnalyzed = application.compatibilityScore !== null && 
                     application.classification !== null;

    return NextResponse.json({
      status: isAnalyzed ? "analyzed" : "pending",
      score: application.compatibilityScore,
      classification: application.classification
    });

  } catch (error) {
    console.error("Application status error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
