
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * API to check and update expired subscriptions
 * This should be called by a cron job daily
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret-123";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find all trial subscriptions that have expired
    const expiredTrials = await db.subscription.findMany({
      where: {
        status: "trial",
        trialEndDate: {
          lt: now
        }
      }
    });

    // Update expired trials
    for (const subscription of expiredTrials) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "expired",
        }
      });
    }

    // Find subscriptions that ended (for paid plans)
    const expiredSubscriptions = await db.subscription.findMany({
      where: {
        status: {
          in: ["active", "past_due"]
        },
        endDate: {
          lt: now
        }
      }
    });

    // Update expired subscriptions
    for (const subscription of expiredSubscriptions) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "expired",
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Atualizados ${expiredTrials.length + expiredSubscriptions.length} assinaturas expiradas`,
      expiredTrials: expiredTrials.length,
      expiredSubscriptions: expiredSubscriptions.length,
      processedAt: now.toISOString(),
    });

  } catch (error) {
    console.error("Error checking subscription expiry:", error);
    return NextResponse.json(
      { error: "Erro ao verificar assinaturas expiradas" },
      { status: 500 }
    );
  }
}

// Allow manual trigger via GET for testing
export async function GET(request: NextRequest) {
  return POST(request);
}
