
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const isSuperAdmin = user.role === 'superadmin';

    // Estatísticas gerais
    const totalJobs = await db.job.count({
      where: isSuperAdmin ? {} : { userId: user.id }
    });

    const activeJobs = await db.job.count({
      where: {
        ...(isSuperAdmin ? {} : { userId: user.id }),
        status: 'active'
      }
    });

    const totalApplications = await db.application.count({
      where: isSuperAdmin ? {} : {
        job: { userId: user.id }
      }
    });

    const pendingApplications = await db.application.count({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        status: 'pending'
      }
    });

    const approvedApplications = await db.application.count({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        status: 'approved'
      }
    });

    const rejectedApplications = await db.application.count({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        status: 'rejected'
      }
    });

    // Candidatos por região (agrupado por estado)
    const applicationsByState = await db.application.groupBy({
      by: ['candidateEmail'],
      where: isSuperAdmin ? {} : {
        job: { userId: user.id }
      },
      _count: true
    });

    // Buscar jobs com localização para análise por região
    const jobs = await db.job.findMany({
      where: isSuperAdmin ? {} : { userId: user.id },
      select: {
        id: true,
        state: true,
        city: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    // Agregar por estado
    const stateDistribution: Record<string, number> = {};
    jobs.forEach(job => {
      const state = job.state || 'Não especificado';
      stateDistribution[state] = (stateDistribution[state] || 0) + job._count.applications;
    });

    // Candidatos por classificação de IA
    const strongCandidates = await db.application.count({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        classification: 'strong'
      }
    });

    const potentialCandidates = await db.application.count({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        classification: 'potential'
      }
    });

    const reviewCandidates = await db.application.count({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        classification: 'review'
      }
    });

    const incompatibleCandidates = await db.application.count({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        classification: 'incompatible'
      }
    });

    // Taxa de aprovação
    const approvalRate = totalApplications > 0
      ? ((approvedApplications / totalApplications) * 100).toFixed(1)
      : '0';

    // Taxa de conversão (approved + strong)
    const conversionRate = totalApplications > 0
      ? (((approvedApplications + strongCandidates) / totalApplications) * 100).toFixed(1)
      : '0';

    // Score médio de compatibilidade
    const avgCompatibility = await db.application.aggregate({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        compatibilityScore: { not: null }
      },
      _avg: {
        compatibilityScore: true
      }
    });

    // Aplicações por dia (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applicationsByDay = await db.application.groupBy({
      by: ['createdAt'],
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true
    });

    // Processar dados por dia
    const dailyApplications: Record<string, number> = {};
    applicationsByDay.forEach(app => {
      const date = new Date(app.createdAt).toISOString().split('T')[0];
      dailyApplications[date] = (dailyApplications[date] || 0) + app._count;
    });

    // Distribuição por tipo de vaga
    const jobsByType = await db.job.groupBy({
      by: ['type'],
      where: isSuperAdmin ? {} : { userId: user.id },
      _count: true
    });

    const typeDistribution: Record<string, number> = {};
    jobsByType.forEach(job => {
      const typeLabels: Record<string, string> = {
        'full-time': 'Tempo Integral',
        'part-time': 'Meio Período',
        'contract': 'Contrato'
      };
      const jobType = job.type || 'Outros';
      const label = typeLabels[jobType] || jobType;
      typeDistribution[label] = job._count;
    });

    // Top 5 vagas com mais candidaturas
    const topJobs = await db.job.findMany({
      where: isSuperAdmin ? {} : { userId: user.id },
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

    // Tempo médio para aprovação (em dias)
    const approvedApps = await db.application.findMany({
      where: {
        ...(isSuperAdmin ? {} : { job: { userId: user.id } }),
        status: 'approved'
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    let avgApprovalTime = 0;
    if (approvedApps.length > 0) {
      const totalDays = approvedApps.reduce((sum, app) => {
        const diffTime = Math.abs(app.updatedAt.getTime() - app.createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      avgApprovalTime = Math.round(totalDays / approvedApps.length);
    }

    return NextResponse.json({
      overview: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        approvalRate: parseFloat(approvalRate),
        conversionRate: parseFloat(conversionRate),
        avgCompatibilityScore: avgCompatibility._avg.compatibilityScore || 0,
        avgApprovalTime
      },
      classification: {
        strong: strongCandidates,
        potential: potentialCandidates,
        review: reviewCandidates,
        incompatible: incompatibleCandidates
      },
      stateDistribution,
      dailyApplications,
      typeDistribution,
      topJobs: topJobs.map((job: { id: string; title: string; _count: { applications: number } }) => ({
        id: job.id,
        title: job.title,
        applications: job._count.applications
      }))
    });

  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
