
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const jobs = await db.job.findMany({
      where: { status: "active" },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        type: true,
        createdAt: true,
        user: {
          select: {
            companyName: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }) as any[];

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      companyName: job.user.companyName || "Empresa",
      createdAt: job.createdAt,
      _count: {
        applications: job._count.applications,
      },
    }));

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error("Public jobs GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
