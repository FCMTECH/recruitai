
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const criteriaSchema = z.object({
  criterion: z.string().min(1, "Critério é obrigatório"),
  description: z.string().optional(),
  weight: z.number().min(1).max(100)
});

const jobSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  requirements: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract"]).default("full-time"),
  workMode: z.enum(["remoto", "hibrido", "presencial"]).default("presencial"),
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

    // Verificar assinatura e limites do plano
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['trial', 'active']
        }
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Você precisa de um plano ativo para criar vagas. Visite a página de planos para começar." },
        { status: 403 }
      );
    }

    // Verificar se o período de teste expirou
    if (subscription.status === 'trial' && subscription.trialEndDate) {
      if (new Date() > subscription.trialEndDate) {
        await db.subscription.update({
          where: { id: subscription.id },
          data: { status: 'expired' }
        });
        return NextResponse.json(
          { error: "Seu período de teste expirou. Assine um plano para continuar criando vagas." },
          { status: 403 }
        );
      }
    }

    // Resetar contador se mudou o mês
    const now = new Date();
    const lastReset = subscription.lastResetDate;
    let jobsThisMonth = subscription.jobsCreatedThisMonth;

    if (!lastReset || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      jobsThisMonth = 0;
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          jobsCreatedThisMonth: 0,
          lastResetDate: now
        }
      });
    }

    // Verificar limite de vagas do plano
    if (jobsThisMonth >= subscription.plan.jobLimit) {
      return NextResponse.json(
        { 
          error: `Você atingiu o limite de ${subscription.plan.jobLimit} vagas por mês do seu plano ${subscription.plan.displayName}. Faça upgrade para criar mais vagas.`,
          limitReached: true,
          currentPlan: subscription.plan.name,
          jobsCreated: jobsThisMonth,
          jobLimit: subscription.plan.jobLimit
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, requirements, location, country, state, city, type, workMode, criteria } = jobSchema.parse(body);

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
        country,
        state,
        city,
        type,
        workMode,
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

    // Incrementar contador de vagas criadas
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        jobsCreatedThisMonth: jobsThisMonth + 1
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
