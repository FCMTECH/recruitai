
"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Search,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  LogOut,
  TrendingUp,
  Eye,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard-header";

interface Job {
  id: string;
  title: string;
  description?: string;
  companyName: string;
  location?: string;
  type?: string;
  createdAt: string;
  matchPercentage?: number;
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  currentStage: {
    name: string;
  } | null;
  aiAnalysis: {
    compatibilityScore: number;
    classification: string;
  } | null;
  job: {
    id: string;
    title: string;
    companyName: string;
    location?: string;
    type?: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function CandidateDashboard() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<"applications" | "jobs">("applications");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?type=candidate");
    } else if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      if (userRole !== "candidate") {
        router.push("/dashboard");
      } else {
        fetchApplications();
        fetchJobs();
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, jobs]);

  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const response = await fetch("/api/candidates/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
        setStats(data.stats);
      } else {
        toast.error("Erro ao carregar candidaturas");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Erro ao carregar candidaturas");
    } finally {
      setIsLoadingApps(false);
    }
  };

  const fetchJobs = async () => {
    setIsLoadingJobs(true);
    try {
      // Try to fetch jobs with match percentages
      const matchResponse = await fetch("/api/candidates/job-match");
      if (matchResponse.ok) {
        const data = await matchResponse.json();
        setJobs(data.jobs);
        setFilteredJobs(data.jobs);
        
        // Check profile completeness and show prompt if needed
        if (!data.profileCompleteness.hasResume) {
          toast.info("Complete seu perfil para ver a compatibilidade com as vagas", {
            action: {
              label: "Completar Perfil",
              onClick: () => router.push("/candidate/profile"),
            },
          });
        }
      } else {
        // Fallback to public jobs
        const publicResponse = await fetch("/api/jobs/public");
        if (publicResponse.ok) {
          const data = await publicResponse.json();
          setJobs(data);
          setFilteredJobs(data);
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Erro ao carregar vagas");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const filterJobs = () => {
    if (!searchQuery) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredJobs(filtered);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: "Em Análise", className: "bg-yellow-500/10 text-yellow-700", icon: Clock },
      approved: { label: "Aprovado", className: "bg-green-500/10 text-green-700", icon: CheckCircle2 },
      rejected: { label: "Rejeitado", className: "bg-red-500/10 text-red-700", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getClassificationBadge = (classification: string) => {
    const classConfig: Record<string, { className: string }> = {
      "🟢": { className: "bg-green-500/10 text-green-700" },
      "🔵": { className: "bg-blue-500/10 text-blue-700" },
      "🟡": { className: "bg-yellow-500/10 text-yellow-700" },
      "🔴": { className: "bg-red-500/10 text-red-700" },
    };

    const config = classConfig[classification] || { className: "bg-gray-500/10 text-gray-700" };

    return (
      <Badge variant="outline" className={config.className}>
        {classification}
      </Badge>
    );
  };

  if (status === "loading" || isLoadingApps) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Olá, {(session?.user as any)?.name || "Candidato"}! 👋
          </h2>
          <p className="text-muted-foreground">
            Acompanhe suas candidaturas e encontre novas oportunidades
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Candidaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.total}</div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.pending}</div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprovadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{stats.approved}</div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </div>
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "applications" ? "default" : "outline"}
            className={activeTab === "applications" ? "bg-gradient-to-r from-primary to-accent" : ""}
            onClick={() => setActiveTab("applications")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Minhas Candidaturas
          </Button>
          <Button
            variant={activeTab === "jobs" ? "default" : "outline"}
            className={activeTab === "jobs" ? "bg-gradient-to-r from-primary to-accent" : ""}
            onClick={() => setActiveTab("jobs")}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar Vagas
          </Button>
        </div>

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div>
            {applications.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Nenhuma candidatura ainda</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Comece a buscar vagas e candidate-se para aparecer aqui
                  </p>
                  <Button
                    onClick={() => setActiveTab("jobs")}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    Buscar Vagas
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {applications.map((application) => (
                  <Card key={application.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{application.job.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span className="font-medium">{application.job.companyName}</span>
                            </div>
                            {application.job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{application.job.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Aplicado em {formatDate(application.appliedAt)}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getStatusBadge(application.status)}
                            {application.job.type && (
                              <Badge variant="outline">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {application.job.type}
                              </Badge>
                            )}
                            {application.currentStage && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                                Etapa: {application.currentStage.name}
                              </Badge>
                            )}
                            {application.aiAnalysis && (
                              <>
                                {getClassificationBadge(application.aiAnalysis.classification)}
                                <Badge variant="outline">
                                  Compatibilidade: {application.aiAnalysis.compatibilityScore}%
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div>
            {/* Search */}
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cargo, empresa ou localização..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Jobs List */}
            {isLoadingJobs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhuma vaga encontrada</p>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros de busca
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span className="font-medium">{job.companyName}</span>
                            </div>
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.type && (
                              <Badge variant="outline" className="bg-primary/10">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {job.type}
                              </Badge>
                            )}
                            {job.matchPercentage !== undefined && (
                              <Badge 
                                variant="outline" 
                                className={
                                  job.matchPercentage >= 70 
                                    ? "bg-green-500/10 text-green-700 border-green-300" 
                                    : job.matchPercentage >= 50
                                    ? "bg-yellow-500/10 text-yellow-700 border-yellow-300"
                                    : "bg-orange-500/10 text-orange-700 border-orange-300"
                                }
                              >
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {job.matchPercentage}% compatível
                              </Badge>
                            )}
                          </div>
                          {job.description && (
                            <CardDescription className="line-clamp-2 text-base mb-4">
                              {job.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link href={`/vagas/${job.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </Link>
                        <Link href={`/vagas/${job.id}`}>
                          <Button className="bg-gradient-to-r from-primary to-accent">
                            Candidatar-se
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
