
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
        user: {
          select: {
            companyName: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedJobs = jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      companyName: job.user.companyName || "Empresa"
    }));

    return NextResponse.json(formattedJobs);

  } catch (error) {
    console.error("Public jobs GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
