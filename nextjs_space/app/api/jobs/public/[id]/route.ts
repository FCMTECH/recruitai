
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await db.job.findUnique({
      where: {
        id: params.id,
        status: "active",
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        location: true,
        country: true,
        state: true,
        city: true,
        type: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            companyName: true,
          },
        },
        criteria: {
          select: {
            id: true,
            criterion: true,
            description: true,
            weight: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Vaga não encontrada" },
        { status: 404 }
      );
    }

    // Format the response
    const { user, ...jobData } = job;
    const formattedJob = {
      ...jobData,
      companyName: user?.companyName || "Empresa",
    };

    return NextResponse.json(formattedJob);
  } catch (error) {
    console.error("Error fetching public job:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vaga" },
      { status: 500 }
    );
  }
}
