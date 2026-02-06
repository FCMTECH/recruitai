"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Target,
  Award,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Stats {
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
  };
  classification: {
    strong: number;
    potential: number;
    review: number;
    incompatible: number;
  };
  topJobs: Array<{ id: string; title: string; applications: number }>;
}

function StatCard({ title, value, icon: Icon, trend, className }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-md", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-stone-500">{title}</p>
            <p className="text-2xl sm:text-3xl font-semibold text-stone-900">{value}</p>
            {trend && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="p-2 sm:p-3 rounded-xl bg-stone-100">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-stone-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 sm:h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadStats();
    }
  }, [status, router]);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/dashboard/advanced-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const userName = session?.user?.name || "Usuário";
  const companyName = (session?.user as any)?.companyName || "";

  const classificationData = useMemo(() => {
    if (!stats) return [];
    const { classification } = stats;
    const total = classification.strong + classification.potential + classification.review + classification.incompatible;
    if (total === 0) return [];
    return [
      { label: "Fortes", value: classification.strong, color: "bg-emerald-500", percent: Math.round((classification.strong / total) * 100) },
      { label: "Potenciais", value: classification.potential, color: "bg-amber-500", percent: Math.round((classification.potential / total) * 100) },
      { label: "Revisar", value: classification.review, color: "bg-blue-500", percent: Math.round((classification.review / total) * 100) },
      { label: "Incomp.", value: classification.incompatible, color: "bg-stone-400", percent: Math.round((classification.incompatible / total) * 100) },
    ];
  }, [stats]);

  if (status === "loading" || loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-cream">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-stone-900">
              Olá, {userName.split(" ")[0]}!
            </h1>
            {companyName && (
              <p className="text-sm text-stone-500">{companyName}</p>
            )}
          </div>
          <Link href="/dashboard/jobs/create">
            <Button className="bg-stone-900 hover:bg-stone-800 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Vaga
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            title="Vagas Ativas"
            value={stats?.overview.activeJobs || 0}
            icon={Briefcase}
          />
          <StatCard
            title="Candidaturas"
            value={stats?.overview.totalApplications || 0}
            icon={Users}
          />
          <StatCard
            title="Pendentes"
            value={stats?.overview.pendingApplications || 0}
            icon={Clock}
          />
          <StatCard
            title="Aprovados"
            value={stats?.overview.approvedApplications || 0}
            icon={CheckCircle}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* AI Classification */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Classificação IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {classificationData.length > 0 ? (
                <>
                  <div className="flex h-3 rounded-full overflow-hidden bg-stone-100">
                    {classificationData.map((item, idx) => (
                      <div
                        key={idx}
                        className={cn(item.color, "transition-all duration-500")}
                        style={{ width: `${item.percent}%` }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {classificationData.map((item, idx) => (
                      <div key={idx} className="text-center p-2 rounded-lg bg-stone-50">
                        <div className={cn("w-2 h-2 rounded-full mx-auto mb-1", item.color)} />
                        <p className="text-xs text-stone-500">{item.label}</p>
                        <p className="text-lg font-semibold text-stone-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-stone-500">
                  <Target className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                  <p className="text-sm">Nenhuma candidatura analisada ainda</p>
                </div>
              )}
              
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-stone-50">
                  <p className="text-xs text-stone-500">Taxa de Aprovação</p>
                  <p className="text-xl font-semibold text-stone-900">
                    {stats?.overview.approvalRate || 0}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50">
                  <p className="text-xs text-stone-500">Score Médio</p>
                  <p className="text-xl font-semibold text-stone-900">
                    {Math.round(stats?.overview.avgCompatibilityScore || 0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Jobs */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Vagas em Destaque
                </CardTitle>
                <Link href="/dashboard/jobs">
                  <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-900">
                    Ver todas
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.topJobs && stats.topJobs.length > 0 ? (
                <div className="space-y-2">
                  {stats.topJobs.map((job, idx) => (
                    <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-medium flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-stone-800 group-hover:text-stone-900 truncate max-w-[180px] sm:max-w-none">
                            {job.title}
                          </span>
                        </div>
                        <span className="text-sm text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
                          {job.applications} cand.
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-500">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                  <p className="text-sm">Nenhuma vaga criada ainda</p>
                  <Link href="/dashboard/jobs/create">
                    <Button variant="outline" size="sm" className="mt-3">
                      Criar primeira vaga
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/dashboard/jobs">
            <Card className="hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 text-center">
                <Briefcase className="w-6 h-6 mx-auto mb-2 text-stone-400 group-hover:text-amber-500 transition-colors" />
                <p className="text-sm font-medium text-stone-700">Gerenciar Vagas</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/talents">
            <Card className="hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-stone-400 group-hover:text-amber-500 transition-colors" />
                <p className="text-sm font-medium text-stone-700">Banco de Talentos</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/team">
            <Card className="hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-stone-400 group-hover:text-amber-500 transition-colors" />
                <p className="text-sm font-medium text-stone-700">Equipe</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/profile">
            <Card className="hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-stone-400 group-hover:text-amber-500 transition-colors" />
                <p className="text-sm font-medium text-stone-700">Meu Plano</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
