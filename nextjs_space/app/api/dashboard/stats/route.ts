
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's jobs stats
    const totalJobs = await db.job.count({
      where: { userId: session.user.id }
    });

    const activeJobs = await db.job.count({
      where: { 
        userId: session.user.id,
        status: "active"
      }
    });

    // Get applications stats for user's jobs
    const totalApplications = await db.application.count({
      where: {
        job: {
          userId: session.user.id
        }
      }
    });

    const pendingApplications = await db.application.count({
      where: {
        job: {
          userId: session.user.id
        },
        status: "pending"
      }
    });

    return NextResponse.json({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
