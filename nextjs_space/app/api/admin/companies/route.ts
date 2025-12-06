
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

    const companies = await db.user.findMany({
      where: { role: "company" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            jobs: true
          }
        }
      }
    });

    // Get job and application counts for each company
    const companiesWithStats = await Promise.all(
      companies.map(async (company: { id: string; name: string | null; email: string; companyName: string | null; createdAt: Date; _count: { jobs: number } }) => {
        const jobIds = await db.job.findMany({
          where: { userId: company.id },
          select: { id: true }
        });

        const applicationCount = await db.application.count({
          where: {
            jobId: {
              in: jobIds.map(j => j.id)
            }
          }
        });

        return {
          ...company,
          stats: {
            jobs: company._count.jobs,
            applications: applicationCount
          }
        };
      })
    );

    return NextResponse.json({ companies: companiesWithStats });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
