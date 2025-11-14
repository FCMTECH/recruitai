
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Only check subscription for companies
    if (session.user.role !== "company") {
      return NextResponse.json({
        isActive: true,
        isExpired: false,
        isLimitReached: false,
        status: null,
        plan: null,
        trialEndDate: null,
        endDate: null,
      });
    }

    // Get user's subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ["trial", "active", "past_due"]
        }
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!subscription) {
      return NextResponse.json({
        isActive: false,
        isExpired: true,
        isLimitReached: false,
        status: "expired",
        plan: null,
        trialEndDate: null,
        endDate: null,
      });
    }

    const now = new Date();
    const isExpired = subscription.trialEndDate && new Date(subscription.trialEndDate) < now;
    const isLimitReached = subscription.jobsCreatedThisMonth >= subscription.plan.jobLimit;

    return NextResponse.json({
      isActive: !isExpired,
      isExpired: isExpired || false,
      isLimitReached,
      status: isExpired ? "expired" : subscription.status,
      plan: {
        displayName: subscription.plan.displayName,
        jobLimit: subscription.plan.jobLimit,
        jobsCreatedThisMonth: subscription.jobsCreatedThisMonth,
      },
      trialEndDate: subscription.trialEndDate,
      endDate: subscription.endDate,
    });

  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Erro ao verificar assinatura" },
      { status: 500 }
    );
  }
}
