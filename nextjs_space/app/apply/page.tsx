
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    jobId: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [jobs, setJobs] = useState<Array<{id: string, title: string, companyName: string}>>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();

  // Load available jobs
  useState(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs/public");
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas arquivos PDF, DOC e DOCX são aceitos",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "Arquivo obrigatório",
        description: "Selecione seu currículo para continuar",
        variant: "destructive"
      });
      return;
    }

    if (!formData.jobId) {
      toast({
        title: "Vaga obrigatória",
        description: "Selecione a vaga de interesse",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data for file upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("candidateName", formData.candidateName);
      uploadFormData.append("candidateEmail", formData.candidateEmail);
      uploadFormData.append("candidatePhone", formData.candidatePhone);
      uploadFormData.append("jobId", formData.jobId);

      const response = await fetch("/api/applications", {
        method: "POST",
        body: uploadFormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar candidatura");
      }

      const result = await response.json();

      toast({
        title: "Currículo enviado com sucesso!",
        description: "Nossa IA está analisando seu perfil...",
      });

      setIsSubmitting(false);
      setIsAnalyzing(true);

      // Poll for analysis completion
      const pollAnalysis = async () => {
        try {
          const analysisResponse = await fetch(`/api/applications/${result.id}/status`);
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            if (analysisData.status === "analyzed") {
              setIsAnalyzing(false);
              setIsComplete(true);
              toast({
                title: "Análise concluída!",
                description: "Seu perfil foi analisado com sucesso. A empresa receberá sua candidatura.",
              });
              return;
            }
          }
          
          // Continue polling if not complete
          setTimeout(pollAnalysis, 3000);
        } catch (error) {
          console.error("Polling error:", error);
          setTimeout(pollAnalysis, 5000);
        }
      };

      setTimeout(pollAnalysis, 2000);

    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Erro ao enviar candidatura",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      jobId: ""
    });
    setFile(null);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl text-center">
          <CardContent className="pt-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Candidatura Enviada!
            </h2>
            <p className="text-gray-600 mb-6">
              Seu currículo foi analisado com sucesso. A empresa receberá sua candidatura
              com um relatório detalhado da nossa IA sobre seu perfil.
            </p>
            <div className="space-y-3">
              <Button
                onClick={resetForm}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Enviar Outra Candidatura
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl text-center">
          <CardContent className="pt-8">
            <div className="relative mb-6">
              <Brain className="h-16 w-16 text-blue-600 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analisando Currículo...
            </h2>
            <p className="text-gray-600 mb-4">
              Nossa IA está analisando seu perfil e calculando a compatibilidade
              com a vaga. Isso pode levar alguns instantes.
            </p>
            <div className="bg-blue-100 rounded-lg p-3 text-sm text-blue-800">
              <span className="font-medium">✨ Processo em andamento:</span>
              <br />
              Extração de dados • Análise de experiência • Cálculo de score
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">RecruitAI</span>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
          >
            Voltar ao Início
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Envie seu Currículo
          </h1>
          <p className="text-gray-600">
            Nossa IA analisará automaticamente seu perfil e calculará
            a compatibilidade com a vaga desejada.
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Dados da Candidatura</span>
            </CardTitle>
            <CardDescription>
              Preencha seus dados e faça o upload do seu currículo.
              Não é necessário criar conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Selection */}
              <div>
                <Label htmlFor="jobId">Vaga de Interesse *</Label>
                {isLoadingJobs ? (
                  <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                ) : (
                  <select
                    id="jobId"
                    name="jobId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.jobId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione uma vaga</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} - {job.companyName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Personal Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidateName">Nome Completo *</Label>
                  <Input
                    id="candidateName"
                    name="candidateName"
                    placeholder="Seu nome completo"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="candidateEmail">Email *</Label>
                  <Input
                    id="candidateEmail"
                    name="candidateEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.candidateEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="candidatePhone">Telefone</Label>
                <Input
                  id="candidatePhone"
                  name="candidatePhone"
                  placeholder="(11) 99999-9999"
                  value={formData.candidatePhone}
                  onChange={handleInputChange}
                />
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="resume">Currículo *</Label>
                <div className="mt-2">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="resume"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para enviar</span> ou arraste o arquivo
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC ou DOCX (máx. 10MB)
                        </p>
                      </div>
                      <input
                        id="resume"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  
                  {file && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {file.name}
                        </span>
                        <span className="text-xs text-blue-600">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Uso de Dados e IA</p>
                    <p>
                      Seus dados serão usados apenas para análise da candidatura.
                      Nossa IA processará seu currículo para calcular compatibilidade
                      com a vaga. As informações não serão compartilhadas com terceiros.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar Candidatura
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
