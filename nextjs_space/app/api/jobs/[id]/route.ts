
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
