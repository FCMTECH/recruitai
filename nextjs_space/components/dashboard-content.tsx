
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Plus, Users, Briefcase, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
}

interface Subscription {
  id: string;
  status: string;
  jobsCreatedThisMonth: number;
  trialEndsAt?: string;
  plan: {
    displayName: string;
    name: string;
    jobLimit: number;
  };
}

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [mounted, status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
      fetchSubscription();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/current");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  if (!mounted || status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">ATS Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user?.role === "superadmin" && (
              <Link href="/admin">
                <Button variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  🔧 Painel Admin
                </Button>
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              {session?.user?.companyName}
            </span>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {session?.user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Gerencie suas vagas e encontre os melhores candidatos com análise de IA.
          </p>
        </div>

        {/* Plan Information */}
        {subscription ? (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Plano {subscription.plan.displayName}
                    </h3>
                    {subscription.status === 'trial' && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Período de Teste
                      </span>
                    )}
                    {subscription.status === 'active' && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-900">
                        {subscription.jobsCreatedThisMonth}
                      </span>
                      {' / '}
                      <span>{subscription.plan.jobLimit}</span>
                      <span className="ml-1">vagas usadas este mês</span>
                    </div>
                    {subscription.status === 'trial' && subscription.trialEndsAt && (
                      <div>
                        <span className="text-yellow-700 font-medium">
                          Teste expira em {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        subscription.jobsCreatedThisMonth >= subscription.plan.jobLimit
                          ? 'bg-red-500'
                          : subscription.jobsCreatedThisMonth / subscription.plan.jobLimit > 0.8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min((subscription.jobsCreatedThisMonth / subscription.plan.jobLimit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="ml-6">
                  <Button asChild variant="outline">
                    <Link href="/pricing">
                      {subscription.plan.name === 'free' ? 'Escolher Plano' : 'Fazer Upgrade'}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Nenhum plano ativo
                  </h3>
                  <p className="text-sm text-gray-600">
                    Escolha um plano para começar a criar vagas e receber candidatos
                  </p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/pricing">
                    Ver Planos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vagas
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobs} ativas
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Candidatos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApplications} pendentes
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Análise
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                Automática com IA
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo Médio
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30s</div>
              <p className="text-xs text-muted-foreground">
                Por análise
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <span>Criar Nova Vaga</span>
              </CardTitle>
              <CardDescription>
                Configure critérios personalizados e comece a receber candidatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/jobs/create">
                  Criar Vaga
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Gerenciar Vagas</span>
              </CardTitle>
              <CardDescription>
                Visualize candidatos, analise resultados da IA e tome decisões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/jobs">
                  Ver Todas as Vagas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6" />
              <span>Análise Inteligente de Currículos</span>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Nossa IA analisa automaticamente cada currículo com base nos critérios
              específicos da sua vaga, fornecendo scores detalhados e explicações transparentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">🟢 90-100%</div>
                <div className="text-sm text-blue-100">Forte Candidato</div>
              </div>
              <div>
                <div className="text-2xl font-bold">🔵 70-89%</div>
                <div className="text-sm text-blue-100">Potencial</div>
              </div>
              <div>
                <div className="text-2xl font-bold">🟡 50-69%</div>
                <div className="text-sm text-blue-100">Revisar</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
