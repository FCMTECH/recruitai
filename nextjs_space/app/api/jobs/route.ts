
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const criteriaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  weight: z.number().min(1).max(100),
  required: z.boolean(),
  category: z.enum(["experience", "skills", "education", "location", "languages", "other"])
});

const jobSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  requirements: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract"]).default("full-time"),
  criteria: z.array(criteriaSchema).min(1, "Pelo menos um critério é obrigatório")
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await db.job.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(jobs);

  } catch (error) {
    console.error("Jobs GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, requirements, location, type, criteria } = jobSchema.parse(body);

    // Validate criteria weights sum to 100
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      return NextResponse.json(
        { error: `A soma dos pesos deve ser 100%. Atual: ${totalWeight}%` },
        { status: 400 }
      );
    }

    // Create job with criteria
    const job = await db.job.create({
      data: {
        title,
        description,
        requirements: requirements || "",
        location,
        type,
        status: "active",
        userId: session.user.id,
        criteria: {
          create: criteria
        }
      },
      include: {
        criteria: true
      }
    });

    return NextResponse.json(job);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Jobs POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
