
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Building2,
  Briefcase,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  status: string;
  compatibilityScore: number;
  classification: string;
  createdAt: string;
  job: {
    title: string;
    user: {
      companyName: string;
    };
  };
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "superadmin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== "all") {
      filtered = filtered.filter((app: Application) => app.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (app: Application) =>
          app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job.user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data.applications);
      setFilteredApplications(data.applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Erro ao carregar candidaturas");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getClassificationBadge = (classification: string, score: number) => {
    if (!classification) return null;

    const config: Record<string, { emoji: string; label: string; color: string }> = {
      strong: { emoji: "🟢", label: "Forte", color: "text-green-600" },
      potential: { emoji: "🔵", label: "Potencial", color: "text-blue-600" },
      review: { emoji: "🟡", label: "Revisar", color: "text-yellow-600" },
      incompatible: { emoji: "🔴", label: "Incompatível", color: "text-red-600" },
    };

    const c = config[classification];
    if (!c) return null;

    return (
      <div className={`flex items-center gap-2 ${c.color}`}>
        <span>{c.emoji}</span>
        <span className="font-semibold">{score}%</span>
        <span className="text-sm">({c.label})</span>
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "superadmin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gerenciar Candidaturas
          </h1>
          <p className="text-gray-600">
            {applications.length} candidatura{applications.length !== 1 ? "s" : ""} registrada{applications.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar por candidato, vaga ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{app.candidateName}</CardTitle>
                      {getStatusBadge(app.status)}
                    </div>
                    <CardDescription>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{app.candidateEmail}</span>
                        </div>
                        {app.candidatePhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{app.candidatePhone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{app.job.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{app.job.user.companyName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(app.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  {app.compatibilityScore !== null && (
                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Score de IA</span>
                      </div>
                      {getClassificationBadge(app.classification, app.compatibilityScore)}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Nenhuma candidatura encontrada"
                  : "Nenhuma candidatura registrada"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
