"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Calendar,
  LogOut
} from "lucide-react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

interface AdvancedStats {
  overview: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    approvalRate: number;
    conversionRate: number;
    avgCompatibilityScore: number;
    avgApprovalTime: number;
  };
  classification: {
    strong: number;
    potential: number;
    review: number;
    incompatible: number;
  };
  stateDistribution: Record<string, number>;
  dailyApplications: Record<string, number>;
  typeDistribution: Record<string, number>;
  topJobs: Array<{ id: string; title: string; applications: number }>;
}

export default function DashboardContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/advanced-stats");
      const data = await res.json();
      
      // Validar se a resposta contém os dados esperados
      if (data.error || !data.overview || !data.classification) {
        console.error("Error in API response:", data.error || "Invalid data structure");
        setStats(null);
        return;
      }
      
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Erro ao carregar estatísticas</div>
      </div>
    );
  }

  // Dados para gráficos
  const classificationData = {
    labels: ['Forte', 'Potencial', 'Revisar', 'Incompatível'],
    datasets: [{
      label: 'Candidatos por Classificação',
      data: [
        stats.classification?.strong || 0,
        stats.classification?.potential || 0,
        stats.classification?.review || 0,
        stats.classification?.incompatible || 0
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(251, 191, 36)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2
    }]
  };

  const statusData = {
    labels: ['Pendentes', 'Aprovados', 'Rejeitados'],
    datasets: [{
      label: 'Status das Candidaturas',
      data: [
        stats.overview?.pendingApplications || 0,
        stats.overview?.approvedApplications || 0,
        stats.overview?.rejectedApplications || 0
      ],
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(251, 191, 36)',
        'rgb(34, 197, 94)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2
    }]
  };

  const stateLabels = Object.keys(stats.stateDistribution || {});
  const stateValues = Object.values(stats.stateDistribution || {});
  
  const stateData = {
    labels: stateLabels,
    datasets: [{
      label: 'Candidaturas por Estado',
      data: stateValues,
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  const dailyLabels = Object.keys(stats.dailyApplications || {}).sort();
  const dailyValues = dailyLabels.map(date => (stats.dailyApplications || {})[date] || 0);

  const dailyData = {
    labels: dailyLabels.map(date => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }),
    datasets: [{
      label: 'Candidaturas por Dia',
      data: dailyValues,
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      tension: 0.4
    }]
  };

  const typeLabels = Object.keys(stats.typeDistribution || {});
  const typeValues = Object.values(stats.typeDistribution || {});

  const typeData = {
    labels: typeLabels,
    datasets: [{
      label: 'Vagas por Tipo',
      data: typeValues,
      backgroundColor: [
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(251, 146, 60, 0.8)'
      ],
      borderColor: [
        'rgb(168, 85, 247)',
        'rgb(236, 72, 153)',
        'rgb(251, 146, 60)'
      ],
      borderWidth: 2
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        {/* KPIs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Vagas</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overview?.totalJobs || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.overview?.activeJobs || 0} ativas
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Candidaturas</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overview?.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.overview?.pendingApplications || 0} pendentes
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overview?.approvalRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.overview?.approvedApplications || 0} aprovados
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Score Médio IA</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(stats.overview?.avgCompatibilityScore || 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Compatibilidade média
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Taxa de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.overview?.conversionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Candidatos aprovados + fortes
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Tempo Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.overview?.avgApprovalTime || 0} dias
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para aprovação
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                Candidatos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.classification?.strong || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Classificação alta pela IA
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Classificação de Candidatos
              </CardTitle>
              <CardDescription>Distribuição por análise de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut 
                  data={classificationData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      },
                      datalabels: {
                        color: '#fff',
                        font: {
                          weight: 'bold',
                          size: 14
                        },
                        formatter: (value: number) => value > 0 ? value : ''
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Status das Candidaturas
              </CardTitle>
              <CardDescription>Visão geral do processo seletivo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Pie 
                  data={statusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      },
                      datalabels: {
                        color: '#fff',
                        font: {
                          weight: 'bold',
                          size: 14
                        },
                        formatter: (value: number) => value > 0 ? value : ''
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Candidaturas por Estado
              </CardTitle>
              <CardDescription>Distribuição geográfica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar 
                  data={stateData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      datalabels: {
                        color: '#fff',
                        font: {
                          weight: 'bold',
                          size: 12
                        },
                        formatter: (value: number) => value > 0 ? value : '',
                        anchor: 'end',
                        align: 'start'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Vagas por Tipo de Contratação
              </CardTitle>
              <CardDescription>Distribuição por modalidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut 
                  data={typeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      },
                      datalabels: {
                        color: '#fff',
                        font: {
                          weight: 'bold',
                          size: 14
                        },
                        formatter: (value: number) => value > 0 ? value : ''
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 3 */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Candidaturas nos Últimos 30 Dias
            </CardTitle>
            <CardDescription>Tendência temporal de aplicações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line 
                data={dailyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    datalabels: {
                      color: 'rgb(59, 130, 246)',
                      font: {
                        weight: 'bold',
                        size: 11
                      },
                      formatter: (value: number) => value > 0 ? value : '',
                      align: 'top',
                      offset: 4
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Jobs */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Top 5 Vagas Mais Populares
            </CardTitle>
            <CardDescription>Vagas com maior número de candidaturas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.topJobs || []).map((job, index) => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.applications} candidaturas</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            onClick={() => router.push("/dashboard/jobs/create")}
          >
            <Briefcase className="mr-2 h-5 w-5" />
            Criar Nova Vaga
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard/jobs")}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            Ver Todas as Vagas
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard/talents")}
          >
            <Users className="mr-2 h-5 w-5" />
            Banco de Talentos
          </Button>
        </div>
      </div>
    </div>
  );
}
