
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * API to reset monthly job counters for active subscriptions
 * This should be called by a cron job on the 1st of each month
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret or skip for testing
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret-123";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find all active subscriptions
    const activeSubscriptions = await db.subscription.findMany({
      where: {
        status: {
          in: ["active", "trial"]
        }
      }
    });

    let resetCount = 0;

    for (const subscription of activeSubscriptions) {
      // Check if we need to reset (new month started)
      const lastReset = subscription.lastResetDate ? new Date(subscription.lastResetDate) : new Date(subscription.createdAt);
      const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());

      if (monthsSinceReset >= 1) {
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            jobsCreatedThisMonth: 0,
            lastResetDate: now,
          }
        });
        resetCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Resetados ${resetCount} contadores de vagas`,
      resetCount,
      processedAt: now.toISOString(),
    });

  } catch (error) {
    console.error("Error resetting monthly counters:", error);
    return NextResponse.json(
      { error: "Erro ao resetar contadores mensais" },
      { status: 500 }
    );
  }
}

// Allow manual trigger via GET for testing
export async function GET(request: NextRequest) {
  // Simulate POST for testing purposes
  return POST(request);
}
