
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Check,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  companyName: string;
  location?: string;
  type?: string;
  createdAt: string;
  _count: {
    applications: number;
  };
  criteria?: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
    category: string;
  }>;
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [params.id]);

  const fetchJobDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/public/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        toast.error("Vaga não encontrada");
        router.push("/vagas");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Erro ao carregar vaga");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!session) {
      toast.info("Faça login para se candidatar");
      router.push(`/auth/signin?type=candidate&callbackUrl=/vagas/${params.id}`);
      return;
    }

    const userRole = (session?.user as any)?.role;
    if (userRole !== "candidate") {
      toast.error("Apenas candidatos podem se candidatar a vagas");
      return;
    }

    // Redirecionar direto para candidatura sem validações
    router.push(`/apply?jobId=${params.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hoje";
    if (diffDays === 2) return "Ontem";
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-0 shadow-lg max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium mb-4">Vaga não encontrada</p>
            <Button onClick={() => router.push("/vagas")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Vagas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-8 w-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RecruitAI
              </h1>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              {session && (
                <Link href="/candidate/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Job Header */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">{job.title}</CardTitle>
                <div className="flex items-center gap-4 text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium text-lg">{job.companyName}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {job.location && (
                    <Badge variant="outline" className="text-sm py-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location}
                    </Badge>
                  )}
                  {job.type && (
                    <Badge variant="outline" className="text-sm py-1 bg-primary/10">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.type}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-sm py-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(job.createdAt)}
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1">
                    <FileText className="h-3 w-3 mr-1" />
                    {job._count.applications} candidaturas
                  </Badge>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <Button
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-primary to-accent"
              onClick={handleApply}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Candidatar-se a esta Vaga
                </>
              )}
            </Button>
          </CardHeader>
        </Card>

        {/* Job Description */}
        {job.description && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Descrição da Vaga</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Requirements */}
        {job.requirements && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Requisitos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.requirements}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Criteria */}
        {job.criteria && job.criteria.length > 0 && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Critérios de Avaliação</CardTitle>
              <CardDescription>
                Nossa IA analisará seu perfil com base nesses critérios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {job.criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{criterion.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {criterion.weight}%
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {criterion.category}
                        </Badge>
                      </div>
                      {criterion.description && (
                        <p className="text-sm text-muted-foreground">
                          {criterion.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Pronto para se candidatar?</h3>
            <p className="text-muted-foreground mb-6">
              Nossa IA analisará seu perfil e calculará sua compatibilidade com esta vaga
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent"
              onClick={handleApply}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Candidatar-se Agora
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
