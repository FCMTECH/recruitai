
import { requireSuperAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2, 
  Briefcase, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  ArrowRight,
  Shield,
  CreditCard
} from "lucide-react";

async function getAdminStats() {
  try {
    // Get global statistics
    const [
      totalCompanies,
      totalJobs,
      totalApplications,
      activeJobs,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    ] = await Promise.all([
      db.user.count({
        where: { role: "company" }
      }),
      db.job.count(),
      db.application.count(),
      db.job.count({
        where: { status: "active" }
      }),
      db.application.count({
        where: { status: "pending" }
      }),
      db.application.count({
        where: { status: "approved" }
      }),
      db.application.count({
        where: { status: "rejected" }
      }),
    ]);

    // Get recent activity
    const recentCompanies = await db.user.findMany({
      where: { role: "company" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        createdAt: true,
        _count: {
          select: {
            jobs: true
          }
        }
      }
    });

    const recentJobs = await db.job.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          select: {
            companyName: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    return {
      stats: {
        totalCompanies,
        totalJobs,
        totalApplications,
        activeJobs,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
      },
      recentCompanies,
      recentJobs,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return null;
  }
}

export default async function AdminDashboard() {
  await requireSuperAdmin();
  const data = await getAdminStats();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    );
  }

  const { stats, recentCompanies, recentJobs } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">Visão global da plataforma ATS</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/companies">
            <Button variant="outline" className="w-full h-20 text-lg justify-start gap-3">
              <Building2 className="h-6 w-6" />
              Gerenciar Empresas
            </Button>
          </Link>
          <Link href="/admin/subscriptions">
            <Button variant="outline" className="w-full h-20 text-lg justify-start gap-3">
              <CreditCard className="h-6 w-6" />
              Gerenciar Assinaturas
            </Button>
          </Link>
          <Link href="/admin/admins">
            <Button variant="outline" className="w-full h-20 text-lg justify-start gap-3">
              <Shield className="h-6 w-6" />
              Gerenciar Administradores
            </Button>
          </Link>
          <Link href="/admin/jobs">
            <Button variant="outline" className="w-full h-20 text-lg justify-start gap-3">
              <Briefcase className="h-6 w-6" />
              Gerenciar Vagas
            </Button>
          </Link>
          <Link href="/admin/applications">
            <Button variant="outline" className="w-full h-20 text-lg justify-start gap-3">
              <Users className="h-6 w-6" />
              Gerenciar Candidaturas
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Empresas
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalCompanies}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Empresas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Vagas
              </CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalJobs}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeJobs} ativas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Candidaturas
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.totalApplications}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Todos os candidatos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.totalApplications > 0
                  ? Math.round((stats.approvedApplications / stats.totalApplications) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Candidatos aprovados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {stats.pendingApplications}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Aprovados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {stats.approvedApplications}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Rejeitados
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {stats.rejectedApplications}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Companies */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Empresas Recentes</span>
                <Link href="/admin/companies">
                  <Button variant="ghost" size="sm">
                    Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Últimas empresas cadastradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCompanies.map((company: any) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{company.companyName}</p>
                      <p className="text-sm text-gray-500">{company.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {company._count.jobs} vagas
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vagas Recentes</span>
                <Link href="/admin/jobs">
                  <Button variant="ghost" size="sm">
                    Ver todas <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Últimas vagas publicadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.user?.companyName || 'Empresa não encontrada'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600">
                        {job._count.applications} candidatos
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
