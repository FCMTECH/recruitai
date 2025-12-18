
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "company" && userRole !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Buscar parâmetro de grupo da query string
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    // Se não houver groupId, retornar estatísticas gerais
    if (!groupId || groupId === "all") {
      // Buscar estatísticas gerais (sem filtro de grupo)
      const totalJobs = await db.job.count({
        where: { userId: session.user.id }
      });

      const activeJobs = await db.job.count({
        where: { 
          userId: session.user.id,
          status: "active"
        }
      });

      const totalApplications = await db.application.count({
        where: {
          job: {
            userId: session.user.id
          }
        }
      });

      const pendingApplications = await db.application.count({
        where: {
          job: {
            userId: session.user.id
          },
          status: "pending"
        }
      });

      const approvedApplications = await db.application.count({
        where: {
          job: {
            userId: session.user.id
          },
          status: "approved"
        }
      });

      const rejectedApplications = await db.application.count({
        where: {
          job: {
            userId: session.user.id
          },
          status: "rejected"
        }
      });

      return NextResponse.json({
        groupName: "Todos os Grupos",
        stats: {
          totalJobs,
          activeJobs,
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          approvalRate: totalApplications > 0 ? (approvedApplications / totalApplications * 100).toFixed(1) : 0
        }
      });
    }

    // Buscar informações do grupo
    const group = await db.teamGroup.findUnique({
      where: { 
        id: groupId,
        companyId: session.user.id
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }) as any;

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // IDs dos membros do grupo
    const memberIds = (group.members as any[]).map(m => m.id);

    // Por enquanto, retornamos todas as vagas da empresa
    // Futuramente podemos adicionar lógica para filtrar por grupo
    const groupJobs = await db.job.findMany({
      where: {
        userId: session.user.id
      },
      select: { id: true, status: true }
    }) as { id: string; status: string }[];

    const groupJobIds = groupJobs.map(j => j.id);

    const totalJobs = groupJobs.length;
    const activeJobs = groupJobs.filter(j => j.status === "active").length;

    const totalApplications = await db.application.count({
      where: {
        jobId: { in: groupJobIds }
      }
    });

    const pendingApplications = await db.application.count({
      where: {
        jobId: { in: groupJobIds },
        status: "pending"
      }
    });

    const approvedApplications = await db.application.count({
      where: {
        jobId: { in: groupJobIds },
        status: "approved"
      }
    });

    const rejectedApplications = await db.application.count({
      where: {
        jobId: { in: groupJobIds },
        status: "rejected"
      }
    });

    // Buscar as 5 vagas com mais candidaturas do grupo
    const topJobs = await db.job.findMany({
      where: {
        id: { in: groupJobIds }
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        applications: {
          _count: 'desc'
        }
      },
      take: 5
    });

    const topJobsData = topJobs.map((job: { id: string; title: string; _count: { applications: number } }) => ({
      id: job.id,
      title: job.title,
      applications: job._count.applications
    }));

    return NextResponse.json({
      groupName: group.name,
      groupColor: group.color,
      members: group.members,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        approvalRate: totalApplications > 0 ? (approvedApplications / totalApplications * 100).toFixed(1) : 0
      },
      topJobs: topJobsData
    });

  } catch (error) {
    console.error("Group stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
