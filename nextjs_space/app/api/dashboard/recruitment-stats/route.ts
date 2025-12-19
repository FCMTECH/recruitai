
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
    const whereClause = isSuperAdmin ? {} : { job: { userId: user.id } };

    // Fase 1: Captação e Triagem
    const totalApplications = await db.application.count({ where: whereClause });
    const pendingApplications = await db.application.count({
      where: { ...whereClause, status: 'pending' }
    });

    // Fase 2: Convocação para Entrevista
    const invitedForInterview = await db.application.count({
      where: { ...whereClause, invitedForInterview: true }
    });

    const interviewRate = totalApplications > 0 
      ? ((invitedForInterview / totalApplications) * 100).toFixed(2)
      : '0.00';

    // Fase 3: Realização de Entrevistas
    const attendedInterviews = await db.application.count({
      where: { ...whereClause, attendedInterview: true }
    });

    const attendanceRate = invitedForInterview > 0
      ? ((attendedInterviews / invitedForInterview) * 100).toFixed(2)
      : '0.00';

    const missedInterviews = invitedForInterview - attendedInterviews;

    // Fase 4: Contratação
    const hired = await db.application.count({
      where: { ...whereClause, isHired: true }
    });

    const hireRate = attendedInterviews > 0
      ? ((hired / attendedInterviews) * 100).toFixed(2)
      : '0.00';

    // Fase 5: Métricas de Tempo
    const applications = await db.application.findMany({
      where: {
        ...whereClause,
        isHired: true,
        hiredAt: { not: null }
      },
      select: {
        createdAt: true,
        hiredAt: true,
        invitedAt: true,
        interviewDate: true,
      },
    });

    let avgTimeToHire = 0;
    let avgTimeToInterview = 0;

    if (applications.length > 0) {
      const timesToHire = applications
        .filter((app: { hiredAt: Date | null }) => app.hiredAt)
        .map((app: { createdAt: Date; hiredAt: Date | null; invitedAt: Date | null; interviewDate: Date | null }) => {
          const created = new Date(app.createdAt).getTime();
          const hired = new Date(app.hiredAt!).getTime();
          return (hired - created) / (1000 * 60 * 60 * 24); // dias
        });

      const timesToInterview = applications
        .filter((app: { invitedAt: Date | null }) => app.invitedAt)
        .map((app: { createdAt: Date; hiredAt: Date | null; invitedAt: Date | null; interviewDate: Date | null }) => {
          const created = new Date(app.createdAt).getTime();
          const invited = new Date(app.invitedAt!).getTime();
          return (invited - created) / (1000 * 60 * 60 * 24); // dias
        });

      if (timesToHire.length > 0) {
        avgTimeToHire = parseFloat((timesToHire.reduce((a: number, b: number) => a + b, 0) / timesToHire.length).toFixed(1));
      }

      if (timesToInterview.length > 0) {
        avgTimeToInterview = parseFloat((timesToInterview.reduce((a: number, b: number) => a + b, 0) / timesToInterview.length).toFixed(1));
      }
    }

    // Vagas fechadas (com contratação)
    const closedJobs = await db.job.count({
      where: {
        ...(isSuperAdmin ? {} : { userId: user.id }),
        status: 'closed'
      }
    });

    // Funil de conversão
    const conversionFunnel = {
      totalApplications,
      invitedForInterview,
      attendedInterviews,
      hired,
    };

    // Estatísticas por vaga (top 5 vagas com mais candidaturas)
    const topJobs = await db.job.findMany({
      where: isSuperAdmin ? {} : { userId: user.id },
      take: 5,
      orderBy: {
        applications: {
          _count: 'desc'
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            applications: true
          }
        },
        applications: {
          where: {
            isHired: true
          },
          select: {
            id: true
          }
        }
      }
    });

    const jobsWithStats = topJobs.map((job: { 
      id: string; 
      title: string; 
      status: string; 
      _count: { applications: number }; 
      applications: { id: string }[] 
    }) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      totalApplications: job._count.applications,
      hired: job.applications.length,
    }));

    // Estatísticas mensais (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await db.application.groupBy({
      by: ['createdAt'],
      where: {
        ...whereClause,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: true,
    });

    // Agrupar por mês
    const monthlyData: { [key: string]: { applications: number; hired: number; interviewed: number } } = {};
    
    const allApplicationsLast6Months = await db.application.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true,
        isHired: true,
        invitedForInterview: true,
      }
    });

    allApplicationsLast6Months.forEach((app: { createdAt: Date; isHired: boolean; invitedForInterview: boolean }) => {
      const month = new Date(app.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { applications: 0, hired: 0, interviewed: 0 };
      }
      monthlyData[month].applications += 1;
      if (app.isHired) monthlyData[month].hired += 1;
      if (app.invitedForInterview) monthlyData[month].interviewed += 1;
    });

    return NextResponse.json({
      captacao: {
        totalApplications,
        pendingApplications,
        processed: totalApplications - pendingApplications,
      },
      entrevistas: {
        invited: invitedForInterview,
        attended: attendedInterviews,
        missed: missedInterviews,
        invitationRate: parseFloat(interviewRate),
        attendanceRate: parseFloat(attendanceRate),
      },
      contratacao: {
        hired,
        hireRate: parseFloat(hireRate),
        closedJobs,
      },
      metricas: {
        avgTimeToHire,
        avgTimeToInterview,
      },
      funnel: conversionFunnel,
      topJobs: jobsWithStats,
      monthlyData: Object.entries(monthlyData).map(([month, data]: [string, { applications: number; hired: number; interviewed: number }]) => ({
        month,
        ...data
      })),
    });

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas de recrutamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
