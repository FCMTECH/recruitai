
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    
    // Superadmin pode ver qualquer vaga, empresas só suas vagas
    const job = await db.job.findFirst({
      where: userRole === "superadmin" 
        ? { id: params.id }
        : { 
            id: params.id,
            userId: session.user.id
          },
      include: {
        criteria: true,
        applications: {
          orderBy: [
            { compatibilityScore: "desc" },
            { createdAt: "desc" }
          ]
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job, applications: job.applications });

  } catch (error) {
    console.error("Job detail GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update job (only within 3 days of creation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userRole = (session.user as any).role;

    // Only companies and superadmins can update jobs
    if (userRole !== "company" && userRole !== "superadmin") {
      return NextResponse.json(
        { error: "Apenas empresas podem editar vagas" },
        { status: 403 }
      );
    }

    // Find the job
    const job = await db.job.findFirst({
      where: userRole === "superadmin"
        ? { id: params.id }
        : {
            id: params.id,
            userId: session.user.id
          }
    });

    if (!job) {
      return NextResponse.json({ error: "Vaga não encontrada" }, { status: 404 });
    }

    // Check if job is within 3 days of creation
    const now = new Date();
    const createdAt = new Date(job.createdAt);
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceCreation > 3 && userRole !== "superadmin") {
      return NextResponse.json(
        { 
          error: "Não é possível editar esta vaga",
          message: "Vagas só podem ser editadas até 3 dias após a criação. Para fazer alterações, entre em contato com o suporte."
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, location, country, state, city, type, status } = body;

    // Update the job
    const updatedJob = await db.job.update({
      where: { id: params.id },
      data: {
        title: title || job.title,
        description: description || job.description,
        location: location || job.location,
        country: country || job.country,
        state: state || job.state,
        city: city || job.city,
        type: type || job.type,
        status: status || job.status,
      },
      include: {
        criteria: true,
        applications: true
      }
    });

    return NextResponse.json({
      job: updatedJob,
      message: "Vaga atualizada com sucesso!"
    });

  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar vaga" },
      { status: 500 }
    );
  }
}

// DELETE - Delete job (blocked for all users)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    {
      error: "Exclusão de vagas não permitida",
      message: "Por questões de auditoria e histórico, vagas não podem ser excluídas. Você pode desativá-las alterando o status para 'inactive'."
    },
    { status: 403 }
  );
}
