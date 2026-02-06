
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const isSuperAdmin = user.role === 'superadmin';
    const userFilter = isSuperAdmin ? {} : { userId: user.id };
    const jobFilter = isSuperAdmin ? {} : { job: { userId: user.id } };

    // Execute all counts in parallel for better performance
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      strongCandidates,
      potentialCandidates,
      reviewCandidates,
      incompatibleCandidates,
      avgCompatibility,
      topJobs
    ] = await Promise.all([
      db.job.count({ where: userFilter }),
      db.job.count({ where: { ...userFilter, status: 'active' } }),
      db.application.count({ where: jobFilter }),
      db.application.count({ where: { ...jobFilter, status: 'pending' } }),
      db.application.count({ where: { ...jobFilter, status: 'approved' } }),
      db.application.count({ where: { ...jobFilter, status: 'rejected' } }),
      db.application.count({ where: { ...jobFilter, classification: 'strong' } }),
      db.application.count({ where: { ...jobFilter, classification: 'potential' } }),
      db.application.count({ where: { ...jobFilter, classification: 'review' } }),
      db.application.count({ where: { ...jobFilter, classification: 'incompatible' } }),
      db.application.aggregate({
        where: { ...jobFilter, compatibilityScore: { not: null } },
        _avg: { compatibilityScore: true }
      }),
      db.job.findMany({
        where: userFilter,
        select: { id: true, title: true, _count: { select: { applications: true } } },
        orderBy: { applications: { _count: 'desc' } },
        take: 5
      })
    ]);

    // Calculate rates
    const approvalRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100) : 0;
    const conversionRate = totalApplications > 0 ? (((approvedApplications + strongCandidates) / totalApplications) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        approvalRate: Math.round(approvalRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgCompatibilityScore: avgCompatibility._avg.compatibilityScore || 0,
        avgApprovalTime: 0
      },
      classification: {
        strong: strongCandidates,
        potential: potentialCandidates,
        review: reviewCandidates,
        incompatible: incompatibleCandidates
      },
      stateDistribution: {},
      dailyApplications: {},
      typeDistribution: {},
      topJobs: topJobs.map((job: { id: string; title: string; _count: { applications: number } }) => ({
        id: job.id,
        title: job.title,
        applications: job._count.applications
      }))
    });

  } catch (error) {
    console.error('Error fetching advanced stats:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
