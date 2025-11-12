

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Plus, Users, Briefcase, TrendingUp, FileText, Sparkles, LogOut, Settings } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 animate-pulse">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-lg font-medium text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary" />
              <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RecruitAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            {session?.user?.role === "superadmin" && (
              <Link href="/admin">
                <Button variant="default" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Settings className="mr-2 h-4 w-4" />
                  Painel Admin
                </Button>
              </Link>
            )}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100">
              <span className="text-sm font-medium text-slate-700">
                {session?.user?.companyName}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="border-slate-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 pt-24 pb-12 max-w-7xl">
        {/* Welcome */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Bem-vindo, {session?.user?.name}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Gerencie suas vagas e encontre os melhores talentos com o poder da IA.
          </p>
        </div>

        {/* Plan Information */}
        {subscription ? (
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      Plano {subscription.plan.displayName}
                    </h3>
                    {subscription.status === 'trial' && (
                      <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full shadow-sm">
                        Período de Teste
                      </span>
                    )}
                    {subscription.status === 'active' && (
                      <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full shadow-sm">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">
                        {subscription.jobsCreatedThisMonth}
                      </span>
                      <span className="text-slate-500">/</span>
                      <span className="font-medium">{subscription.plan.jobLimit}</span>
                      <span className="text-slate-500">vagas usadas este mês</span>
                    </div>
                    {subscription.status === 'trial' && subscription.trialEndsAt && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-yellow-700 font-medium text-xs">
                          Teste expira em {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="relative bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        subscription.jobsCreatedThisMonth >= subscription.plan.jobLimit
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : subscription.jobsCreatedThisMonth / subscription.plan.jobLimit > 0.8
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                          : 'bg-gradient-to-r from-primary to-accent'
                      }`}
                      style={{
                        width: `${Math.min((subscription.jobsCreatedThisMonth / subscription.plan.jobLimit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg">
                    <Link href="/pricing">
                      {subscription.plan.name === 'free' ? 'Escolher Plano' : 'Fazer Upgrade'}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Nenhum plano ativo
                  </h3>
                  <p className="text-sm text-slate-600">
                    Escolha um plano para começar a criar vagas e receber candidatos
                  </p>
                </div>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg">
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total de Vagas
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{isLoading ? "..." : stats.totalJobs}</div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.activeJobs} ativas no momento
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total de Candidatos
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                <Users className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{isLoading ? "..." : stats.totalApplications}</div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.pendingApplications} aguardando análise
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Taxa de Análise
              </CardTitle>
              <div className="p-2 rounded-lg bg-violet-50 group-hover:bg-violet-100 transition-colors">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">98%</div>
              <p className="text-xs text-slate-500 mt-1">
                Automática com IA
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Tempo Médio
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">30s</div>
              <p className="text-xs text-slate-500 mt-1">
                Por análise completa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <span>Criar Nova Vaga</span>
              </CardTitle>
              <CardDescription className="text-base">
                Configure critérios personalizados e comece a receber candidatos qualificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg py-6 text-base">
                <Link href="/dashboard/jobs/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Vaga
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Briefcase className="h-6 w-6 text-accent" />
                </div>
                <span>Gerenciar Vagas</span>
              </CardTitle>
              <CardDescription className="text-base">
                Visualize candidatos, analise resultados da IA e tome decisões informadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-2 hover:border-primary hover:text-primary py-6 text-base">
                <Link href="/dashboard/jobs">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Ver Todas as Vagas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-primary via-accent to-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                <Brain className="h-8 w-8" />
              </div>
              <span>Análise Inteligente de Currículos</span>
            </CardTitle>
            <CardDescription className="text-white/90 text-base">
              Nossa IA analisa automaticamente cada currículo com base nos critérios
              específicos da sua vaga, fornecendo scores detalhados e explicações transparentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold mb-2">🟢 90-100%</div>
                <div className="text-sm text-white/90 font-medium">Forte Candidato</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold mb-2">🔵 70-89%</div>
                <div className="text-sm text-white/90 font-medium">Potencial</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold mb-2">🟡 50-69%</div>
                <div className="text-sm text-white/90 font-medium">Revisar</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
