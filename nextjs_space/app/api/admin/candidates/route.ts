import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any)?.role !== "superadmin") {
    return NextResponse.json(
      { error: "Não autorizado. Apenas superadmins podem acessar." },
      { status: 403 }
    );
  }

  try {
    // Get all users with candidate role
    const candidates = await db.user.findMany({
      where: {
        role: "candidate"
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get candidate profiles with additional info
    const candidatesWithProfiles = await Promise.all(
      candidates.map(async (candidate) => {
        const profile = await db.candidateProfile.findUnique({
          where: { email: candidate.email },
          select: {
            fullName: true,
            phone: true,
            city: true,
            state: true,
            resumeUrl: true,
            profession: true,
          }
        });

        // Count applications
        const applicationsCount = await db.application.count({
          where: {
            candidateProfile: {
              email: candidate.email
            }
          }
        });

        return {
          ...candidate,
          profile,
          applicationsCount
        };
      })
    );

    return NextResponse.json(candidatesWithProfiles);
  } catch (error: any) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Erro ao buscar candidatos" },
      { status: 500 }
    );
  }
}
