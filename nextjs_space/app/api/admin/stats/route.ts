
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get global statistics
    const [
      totalCompanies,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    ] = await Promise.all([
      db.user.count({
        where: { role: "company" }
      }),
      db.job.count(),
      db.application.count(),
      db.job.count({
        where: { status: "active" }
      }),
      db.application.count({
        where: { status: "pending" }
      }),
      db.application.count({
        where: { status: "approved" }
      }),
      db.application.count({
        where: { status: "rejected" }
      }),
    ]);

    // Get recent activity
    const recentCompanies = await db.user.findMany({
      where: { role: "company" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        createdAt: true,
        _count: {
          select: {
            jobs: true
          }
        }
      }
    });

    const recentJobs = await db.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          select: {
            companyName: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalCompanies,
        totalJobs,
        totalApplications,
        activeJobs,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
      },
      recentCompanies,
      recentJobs,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
