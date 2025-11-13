
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Apenas candidatos podem se candidatar" },
        { status: 403 }
      );
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "ID da vaga é obrigatório" },
        { status: 400 }
      );
    }

    // Get candidate profile (optional)
    const candidateProfile = await db.candidateProfile.findUnique({
      where: { email: session.user.email! },
    });

    // Check if job exists
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Vaga não encontrada" },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await db.application.findFirst({
      where: {
        jobId,
        candidateEmail: session.user.email!,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Você já se candidatou a esta vaga" },
        { status: 400 }
      );
    }

    // Create application (using default values if profile incomplete)
    const application = await db.application.create({
      data: {
        jobId,
        candidateName: candidateProfile?.fullName || session.user.name || "Candidato",
        candidateEmail: session.user.email!,
        candidatePhone: candidateProfile?.phone || "",
        resumeUrl: candidateProfile?.resumeUrl || "",
        resumeFilename: candidateProfile?.resumeUrl?.split('/').pop() || "sem_curriculo.pdf",
        status: "pending",
      },
    });

    // Trigger AI analysis in the background (async, don't wait)
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/analyze-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        applicationId: application.id,
        jobId: application.jobId,
      }),
    }).catch(err => console.error("AI analysis trigger error:", err));

    return NextResponse.json({
      message: "Candidatura enviada com sucesso",
      application,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Erro ao enviar candidatura" },
      { status: 500 }
    );
  }
}
