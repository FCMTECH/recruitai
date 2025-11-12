
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Search, 
  Building2,
  Users,
  ArrowLeft,
  MapPin,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
  user: {
    companyName: string;
    email: string;
  };
  _count: {
    applications: number;
  };
}

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "superadmin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.user.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setJobs(data.jobs);
      setFilteredJobs(data.jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Erro ao carregar vagas");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      paused: "secondary",
      closed: "destructive",
    };

    const labels: Record<string, string> = {
      active: "Ativa",
      paused: "Pausada",
      closed: "Fechada",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
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
            Gerenciar Vagas
          </h1>
          <p className="text-gray-600">
            {jobs.length} vaga{jobs.length !== 1 ? "s" : ""} cadastrada{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por título, empresa ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      {getStatusBadge(job.status)}
                    </div>
                    <CardDescription>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{job.user.companyName}</span>
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Candidaturas:</span>
                    <span className="font-semibold text-purple-600">
                      {job._count.applications}
                    </span>
                  </div>
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "Nenhuma vaga encontrada" : "Nenhuma vaga cadastrada"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
