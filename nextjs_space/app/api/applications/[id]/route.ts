
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, notes } = await request.json();

    // Verify the application belongs to user's job
    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: {
          userId: session.user.id
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update application
    const updatedApplication = await db.application.update({
      where: { id: params.id },
      data: {
        status,
        notes,
        reviewedAt: new Date()
      }
    });

    return NextResponse.json(updatedApplication);

  } catch (error) {
    console.error("Application PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
