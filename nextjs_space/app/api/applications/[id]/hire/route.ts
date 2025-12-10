
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";

export const dynamic = "force-dynamic";

// PATCH - Mark candidate as hired
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Only companies and superadmins can hire candidates
    if (session.user.role !== "company" && session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Apenas empresas podem contratar candidatos" },
        { status: 403 }
      );
    }

    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            user: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: "Candidatura não encontrada" },
        { status: 404 }
      );
    }

    // Verify ownership (companies can only hire for their own jobs)
    if (session.user.role === "company" && application.job.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para contratar este candidato" },
        { status: 403 }
      );
    }

    // Check if already hired
    if (application.isHired) {
      return NextResponse.json(
        { error: "Candidato já foi contratado para esta vaga" },
        { status: 400 }
      );
    }

    // Mark as hired
    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: {
        isHired: true,
        hiredAt: new Date(),
        hiredBy: session.user.id,
        status: "hired",
        reviewedAt: new Date(),
      },
      include: {
        job: true
      }
    });

    // Send email notification to candidate
    try {
      await sendEmail({
        to: application.candidateEmail,
        ...emailTemplates.applicationStatusUpdate(
          application.candidateName,
          application.job.title,
          "Contratado! 🎉",
          session.user.companyName || "Empresa"
        )
      });
    } catch (emailError) {
      console.error("Erro ao enviar email de contratação:", emailError);
      // Don't fail the request if email fails
    }

    // Create notification for candidate
    try {
      if (application.candidateProfileId) {
        const candidateProfile = await db.candidateProfile.findUnique({
          where: { id: application.candidateProfileId }
        });

        if (candidateProfile) {
          const user = await db.user.findUnique({
            where: { email: candidateProfile.email }
          });

          if (user) {
            await db.notification.create({
              data: {
                userId: user.id,
                type: "hired",
                title: "Parabéns! Você foi contratado! 🎉",
                message: `Você foi contratado para a vaga de ${application.job.title}!`,
                link: `/candidate/dashboard`
              }
            });
          }
        }
      }
    } catch (notificationError) {
      console.error("Erro ao criar notificação:", notificationError);
    }

    return NextResponse.json({
      ...updatedApplication,
      message: "Candidato marcado como contratado com sucesso!"
    });

  } catch (error) {
    console.error("Error hiring candidate:", error);
    return NextResponse.json(
      { error: "Erro ao contratar candidato" },
      { status: 500 }
    );
  }
}
