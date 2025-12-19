"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, ArrowLeft, Filter, Download, Eye, Check, X, ListOrdered, ArrowRight, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface JobStage {
  id: string;
  name: string;
  description?: string;
  order: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  type: string;
  status: string;
  createdAt: string;
  stages?: JobStage[];
  criteria: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
    required: boolean;
    category: string;
  }>;
}

interface Application {
  id: string;
  candidateProfileId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeFilename: string;
  compatibilityScore?: number;
  classification?: string;
  status: string;
  currentStage?: JobStage | null;
  currentStageId?: string | null;
  createdAt: string;
  aiAnalysis?: any;
  highlights?: string[];
  candidateProfile?: {
    id: string;
    fullName?: string;
    email?: string;
    phone?: string;
    profession?: string;
    city?: string;
    state?: string;
  };
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchJobDetails();
    }
  }, [session, params.id]);

  const fetchJobDetails = async () => {
    try {
      const [jobResponse, stagesResponse] = await Promise.all([
        fetch(`/api/jobs/${params.id}`),
        fetch(`/api/jobs/${params.id}/stages`)
      ]);

      if (jobResponse.ok) {
        const data = await jobResponse.json();
        const stages = stagesResponse.ok ? await stagesResponse.json() : [];
        
        setJob({ ...data.job, stages });
        setApplications(data.applications || []);
      } else if (jobResponse.status === 404) {
        router.push("/dashboard/jobs");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadResume = async (applicationId: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/applications/${applicationId}/download`);
      
      if (!response.ok) {
        throw new Error("Erro ao baixar currículo");
      }

      const data = await response.json();
      
      // Open the signed URL in a new tab
      window.open(data.downloadUrl, '_blank');
      toast.success("Download iniciado");
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Erro ao baixar currículo");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleChangeStage = async (applicationId: string, stageId: string | null) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      });

      if (response.ok) {
        toast.success("Fase atualizada com sucesso!");
        fetchJobDetails();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar fase");
      }
    } catch (error) {
      console.error("Error changing stage:", error);
      toast.error("Erro ao atualizar fase");
    }
  };

  const handleAdvanceToNextStage = async (app: Application) => {
    if (!job?.stages || job.stages.length === 0) {
      toast.error("Esta vaga não possui fases configuradas");
      return;
    }

    // Sort stages by order
    const sortedStages = [...job.stages].sort((a: { order: number }, b: { order: number }) => a.order - b.order);
    
    let nextStageId: string | null = null;
    
    if (!app.currentStageId) {
      // If no current stage, move to first stage
      nextStageId = sortedStages[0].id;
    } else {
      // Find current stage index and get next stage
      const currentIndex = sortedStages.findIndex(s => s.id === app.currentStageId);
      if (currentIndex !== -1 && currentIndex < sortedStages.length - 1) {
        nextStageId = sortedStages[currentIndex + 1].id;
      } else {
        toast.info("Candidato já está na última fase");
        return;
      }
    }

    await handleChangeStage(app.id, nextStageId);
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status atualizado com sucesso!");
        fetchJobDetails();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const getClassificationColor = (classification?: string) => {
    switch (classification) {
      case "strong":
        return "bg-green-100 text-green-800 border-green-200";
      case "potential":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "incompatible":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getClassificationText = (classification?: string) => {
    switch (classification) {
      case "strong":
        return "🟢 Forte Compatibilidade";
      case "potential":
        return "🔵 Potencial";
      case "review":
        return "🟡 Requer Análise";
      case "incompatible":
        return "🔴 Incompatível";
      default:
        return "⚪ Pendente";
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const filteredApplications = applications.filter((app: Application) => {
    if (filter !== "all" && app.status !== filter) return false;
    if (stageFilter !== "all") {
      if (stageFilter === "none" && app.currentStageId) return false;
      if (stageFilter !== "none" && app.currentStageId !== stageFilter) return false;
    }
    return true;
  });

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Vaga não encontrada</p>
          <Button onClick={() => router.push("/dashboard/jobs")} className="mt-4">
            Voltar para Vagas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/jobs")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {job.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {applications.length} candidaturas
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Job Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle>Detalhes da Vaga</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Localização</p>
                  <p className="text-sm">{job.location || "Não especificado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="text-sm capitalize">{job.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm capitalize">{job.status}</p>
                </div>

                {/* Stages */}
                {job.stages && job.stages.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      📋 Fases do Processo
                    </p>
                    <div className="space-y-2">
                      {job.stages.map((stage, index) => (
                        <div
                          key={stage.id}
                          className="text-xs p-2 rounded-md bg-muted/50 border"
                        >
                          <span className="font-medium">{index + 1}. {stage.name}</span>
                          {stage.description && (
                            <p className="text-muted-foreground mt-1">{stage.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filtros:</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("all")}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filter === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("pending")}
                    >
                      Pendentes
                    </Button>
                    <Button
                      variant={filter === "approved" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("approved")}
                    >
                      Aprovados
                    </Button>
                    <Button
                      variant={filter === "rejected" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("rejected")}
                    >
                      Rejeitados
                    </Button>
                  </div>

                  {/* Stage Filter */}
                  {job.stages && job.stages.length > 0 && (
                    <>
                      <div className="w-full lg:w-auto">
                        <select
                          value={stageFilter}
                          onChange={(e) => setStageFilter(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          <option value="all">Todas as Fases</option>
                          <option value="none">Sem Fase</option>
                          {job.stages.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Applications */}
            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Nenhuma candidatura encontrada</p>
                    <p className="text-sm text-muted-foreground">
                      Ajuste os filtros ou aguarde novas candidaturas
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredApplications.map((app) => (
                  <Card key={app.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {app.candidateProfile?.fullName || app.candidateName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {app.candidateProfile?.email || app.candidateEmail}
                              </p>
                              {(app.candidateProfile?.phone || app.candidatePhone) && (
                                <p className="text-sm text-muted-foreground">
                                  {app.candidateProfile?.phone || app.candidatePhone}
                                </p>
                              )}
                              {app.candidateProfile?.profession && (
                                <p className="text-xs text-muted-foreground">
                                  {app.candidateProfile.profession}
                                </p>
                              )}
                              {(app.candidateProfile?.city || app.candidateProfile?.state) && (
                                <p className="text-xs text-muted-foreground">
                                  {app.candidateProfile.city}{app.candidateProfile.city && app.candidateProfile.state ? ', ' : ''}{app.candidateProfile.state}
                                </p>
                              )}
                            </div>
                            {getStatusBadge(app.status)}
                          </div>

                          {/* Current Stage */}
                          {app.currentStage && (
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <ListOrdered className="h-3 w-3" />
                                {app.currentStage.name}
                              </span>
                            </div>
                          )}

                          {/* AI Analysis */}
                          {app.compatibilityScore !== undefined && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Brain className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">
                                  Pontuação IA: {app.compatibilityScore.toFixed(1)}%
                                </span>
                              </div>
                              {app.classification && (
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getClassificationColor(app.classification)}`}>
                                  {getClassificationText(app.classification)}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Stage Management */}
                          {job.stages && job.stages.length > 0 && (
                            <div className="mt-4">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                Mudar Fase:
                              </label>
                              <select
                                value={app.currentStageId || ""}
                                onChange={(e) => handleChangeStage(app.id, e.target.value || null)}
                                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm"
                              >
                                <option value="">Sem fase</option>
                                {job.stages.map((stage) => (
                                  <option key={stage.id} value={stage.id}>
                                    {stage.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex lg:flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                          
                          {/* Contact Button */}
                          {(app.candidateProfileId || app.candidateProfile?.id) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/talents/${app.candidateProfileId || app.candidateProfile?.id}`)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Contato
                            </Button>
                          )}

                          {/* Advance Stage Button */}
                          {job.stages && job.stages.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAdvanceToNextStage(app)}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Avançar Fase
                            </Button>
                          )}

                          {app.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusChange(app.id, "approved")}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleStatusChange(app.id, "rejected")}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedApplication(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>Detalhes da Candidatura</CardTitle>
              <CardDescription>
                {selectedApplication.candidateProfile?.fullName || selectedApplication.candidateName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.candidateProfile?.email || selectedApplication.candidateEmail}
                </p>
              </div>
              {(selectedApplication.candidateProfile?.phone || selectedApplication.candidatePhone) && (
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.candidateProfile?.phone || selectedApplication.candidatePhone}
                  </p>
                </div>
              )}
              {selectedApplication.candidateProfile?.profession && (
                <div>
                  <p className="text-sm font-medium">Profissão</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.candidateProfile.profession}
                  </p>
                </div>
              )}
              {(selectedApplication.candidateProfile?.city || selectedApplication.candidateProfile?.state) && (
                <div>
                  <p className="text-sm font-medium">Localização</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.candidateProfile.city}
                    {selectedApplication.candidateProfile.city && selectedApplication.candidateProfile.state ? ', ' : ''}
                    {selectedApplication.candidateProfile.state}
                  </p>
                </div>
              )}
              
              {/* AI Analysis Details */}
              {selectedApplication.aiAnalysis && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Análise da IA
                  </h4>
                  {selectedApplication.aiAnalysis.scoreExplanation && (
                    <div>
                      <p className="text-sm font-medium">Explicação da Pontuação</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedApplication.aiAnalysis.scoreExplanation}
                      </p>
                    </div>
                  )}
                  {selectedApplication.highlights && selectedApplication.highlights.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Destaques</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {selectedApplication.highlights.map((highlight, i) => (
                          <li key={i}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                  Fechar
                </Button>
                <Button 
                  onClick={() => handleDownloadResume(selectedApplication.id)}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isDownloading ? "Baixando..." : "Baixar Currículo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
