"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, CheckCircle, ArrowLeft, FileText, User, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  companyName: string;
  location?: string;
}

interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession() || {};
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const jobIdFromUrl = searchParams?.get("jobId");

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Você precisa estar logado para se candidatar");
      router.push(`/auth/signin?type=candidate&callbackUrl=/apply${jobIdFromUrl ? `?jobId=${jobIdFromUrl}` : ""}`);
      return;
    }

    if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      if (userRole !== "candidate") {
        toast.error("Apenas candidatos podem se candidatar a vagas");
        router.push("/dashboard");
        return;
      }
      
      loadData();
    }
  }, [status, session, jobIdFromUrl]);

  const loadData = async () => {
    if (!jobIdFromUrl) {
      toast.error("ID da vaga não especificado");
      router.push("/vagas");
      return;
    }

    setIsLoadingData(true);
    try {
      // Load job details
      const jobResponse = await fetch(`/api/jobs/public/${jobIdFromUrl}`);
      if (!jobResponse.ok) {
        toast.error("Vaga não encontrada");
        router.push("/vagas");
        return;
      }
      const jobData = await jobResponse.json();
      setSelectedJob(jobData);

      // Load candidate profile
      const profileResponse = await fetch(`/api/candidates/profile?email=${encodeURIComponent(session?.user?.email || '')}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        // A API retorna o profile diretamente, ou null se não existir
        // Se for null, deixamos como null para exibir a mensagem de perfil incompleto
        setCandidateProfile(profileData || null);
      } else {
        // Se houver erro na requisição, definimos como null
        setCandidateProfile(null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    // Validar se tem currículo
    if (!candidateProfile || !candidateProfile.resumeUrl) {
      toast.error("Você precisa enviar seu currículo antes de se candidatar", {
        action: {
          label: "Enviar Currículo",
          onClick: () => router.push("/candidate/profile"),
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/applications/create-from-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: jobIdFromUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar candidatura");
      }

      toast.success("Candidatura enviada com sucesso!");
      setIsComplete(true);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar candidatura");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (status === "loading" || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Success state
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl text-center">
          <CardContent className="pt-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Candidatura Enviada!
            </h2>
            <p className="text-muted-foreground mb-6">
              Sua candidatura foi enviada com sucesso. Acompanhe o status pelo seu dashboard.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/candidate/dashboard")}
                className="w-full bg-gradient-to-r from-primary to-accent"
              >
                Ir para Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/vagas")}
                className="w-full"
              >
                Ver Mais Vagas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">RecruitAI</span>
          </Link>
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Confirmar Candidatura
          </h1>
          <p className="text-muted-foreground">
            Revise os dados antes de enviar sua candidatura
          </p>
        </div>

        {/* Job Info */}
        {selectedJob && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{selectedJob.title}</CardTitle>
              <CardDescription className="text-base">
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{selectedJob.companyName}</span>
                  </div>
                  {selectedJob.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedJob.location}</span>
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Profile Info */}
        {candidateProfile && candidateProfile.resumeUrl ? (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seus Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{candidateProfile.fullName || session?.user?.name || "Não informado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{candidateProfile.email || session?.user?.email || "Não informado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{candidateProfile.phone || "Não informado"}</p>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    Currículo enviado ✓
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg mb-6 border-amber-200 dark:border-amber-800">
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-amber-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Currículo Necessário</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Você precisa enviar seu currículo antes de se candidatar a esta vaga
              </p>
              <Button 
                onClick={() => router.push("/candidate/profile")}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <FileText className="h-4 w-4 mr-2" />
                Enviar Currículo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {candidateProfile && candidateProfile.resumeUrl && (
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando Candidatura...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Confirmar Candidatura
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
