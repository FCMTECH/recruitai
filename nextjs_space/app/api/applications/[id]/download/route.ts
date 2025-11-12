
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { downloadFile } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the application belongs to user's job
    const application = await db.application.findFirst({
      where: {
        id: params.id,
        job: {
          userId: session.user.id
        }
      },
      select: {
        resumeUrl: true,
        resumeFilename: true
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get signed URL for download
    const signedUrl = await downloadFile(application.resumeUrl);

    // Return the signed URL for client-side download
    return NextResponse.json({ downloadUrl: signedUrl });

  } catch (error) {
    console.error("Application download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
