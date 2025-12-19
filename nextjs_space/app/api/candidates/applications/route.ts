
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = (session.user as any).email;

    // Fetch all applications for the candidate
    const applications = await db.application.findMany({
      where: {
        candidateEmail: userEmail,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            user: {
              select: {
                companyName: true,
              },
            },
          },
        },
        currentStage: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform applications to include AI analysis and correct structure
    const transformedApplications = applications.map((app) => ({
      ...app,
      appliedAt: app.createdAt,
      job: {
        ...app.job,
        companyName: app.job.user.companyName,
        user: undefined,
      },
      aiAnalysis: app.aiAnalysis ? {
        compatibilityScore: (app.aiAnalysis as any).compatibilityScore || app.compatibilityScore || 0,
        classification: (app.aiAnalysis as any).classification || app.classification || "🟡",
      } : (app.compatibilityScore ? {
        compatibilityScore: app.compatibilityScore,
        classification: app.classification || "🟡",
      } : null),
    }));

    // Calculate stats
    const stats = {
      total: transformedApplications.length,
      pending: transformedApplications.filter((app: { status: string }) => app.status === "pending").length,
      approved: transformedApplications.filter((app: { status: string }) => app.status === "approved").length,
      rejected: transformedApplications.filter((app: { status: string }) => app.status === "rejected").length,
    };

    return NextResponse.json({ applications: transformedApplications, stats });
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
