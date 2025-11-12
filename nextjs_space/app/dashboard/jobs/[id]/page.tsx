
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, ArrowLeft, Filter, Download, Eye, Check, X, Edit3 } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  type: string;
  status: string;
  createdAt: string;
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
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeFilename: string;
  compatibilityScore?: number;
  classification?: string;
  status: string;
  createdAt: string;
  aiAnalysis?: any;
  highlights?: string[];
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
        setApplications(data.applications || []);
      } else if (response.status === 404) {
        router.push("/dashboard/jobs");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setIsLoading(false);
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
        return "🟢 Forte Candidato";
      case "potential":
        return "🔵 Potencial";
      case "review":
        return "🟡 Revisar";
      case "incompatible":
        return "🔴 Não Compatível";
      default:
        return "⏳ Analisando...";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === "all") return true;
    if (filter === "pending") return app.status === "pending";
    if (filter === "approved") return app.status === "approved";
    if (filter === "rejected") return app.status === "rejected";
    return app.classification === filter;
  });

  const downloadResume = async (applicationId: string, filename: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  if (status === "loading" || status === "unauthenticated" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Vaga não encontrada
            </h2>
            <p className="text-gray-600 mb-4">
              A vaga que você procura não existe ou foi removida.
            </p>
            <Button asChild>
              <Link href="/dashboard/jobs">
                Voltar às Vagas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/jobs")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Análise de Candidatos</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Job Info */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription className="mt-2">
                  {job.location && `📍 ${job.location} • `}
                  {job.type === "full-time" && "Tempo Integral"}
                  {job.type === "part-time" && "Meio Período"}
                  {job.type === "contract" && "Contrato"}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  job.status === "active" ? "bg-green-100 text-green-800" :
                  job.status === "paused" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {job.status === "active" && "Ativa"}
                  {job.status === "paused" && "Pausada"}
                  {job.status === "closed" && "Fechada"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{job.description}</p>
            {job.requirements && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Requisitos:</h4>
                <p className="text-gray-700">{job.requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Applications List */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Candidatos ({applications.length})</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendentes</option>
                      <option value="strong">Fortes</option>
                      <option value="potential">Potenciais</option>
                      <option value="review">Revisar</option>
                      <option value="incompatible">Incompatíveis</option>
                      <option value="approved">Aprovados</option>
                      <option value="rejected">Rejeitados</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {applications.length === 0 
                        ? "Nenhum candidato ainda"
                        : "Nenhum candidato com este filtro"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
                      <div
                        key={application.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedApplication?.id === application.id ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{application.candidateName}</h4>
                            <p className="text-sm text-gray-600">{application.candidateEmail}</p>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-1">
                            {application.compatibilityScore !== null && (
                              <div className="text-lg font-bold text-gray-900">
                                {application.compatibilityScore}%
                              </div>
                            )}
                            
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              getClassificationColor(application.classification)
                            }`}>
                              {getClassificationText(application.classification)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            getStatusColor(application.status)
                          }`}>
                            {getStatusText(application.status)}
                          </span>
                          
                          <span className="text-gray-500">
                            {new Date(application.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {application.highlights && application.highlights.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-1">Destaques:</p>
                            <p className="text-xs text-blue-700 line-clamp-2">
                              {application.highlights[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Detail */}
          <div>
            {selectedApplication ? (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Detalhes do Candidato</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="font-semibold mb-2">Informações Básicas</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Nome:</strong> {selectedApplication.candidateName}</p>
                        <p><strong>Email:</strong> {selectedApplication.candidateEmail}</p>
                        {selectedApplication.candidatePhone && (
                          <p><strong>Telefone:</strong> {selectedApplication.candidatePhone}</p>
                        )}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {selectedApplication.compatibilityScore !== null && (
                      <div>
                        <h4 className="font-semibold mb-2">Análise da IA</h4>
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Score de Compatibilidade</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {selectedApplication.compatibilityScore}%
                            </span>
                          </div>
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                            getClassificationColor(selectedApplication.classification)
                          }`}>
                            {getClassificationText(selectedApplication.classification)}
                          </span>
                        </div>

                        {selectedApplication.highlights && selectedApplication.highlights.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-sm mb-2">Principais Destaques:</h5>
                            <ul className="text-sm space-y-1">
                              {selectedApplication.highlights.map((highlight: string, index: number) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-green-600 mt-1">•</span>
                                  <span>{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => downloadResume(selectedApplication.id, selectedApplication.resumeFilename)}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar Currículo
                      </Button>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updateApplicationStatus(selectedApplication.id, "approved")}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={selectedApplication.status === "approved"}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                          variant="destructive"
                          className="flex-1"
                          disabled={selectedApplication.status === "rejected"}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Selecione um candidato para ver os detalhes
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
