"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Search, Users, Mail, Phone, MapPin, Briefcase, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Candidate {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  emailVerified: string | null;
  profile: {
    fullName: string;
    phone: string | null;
    city: string | null;
    state: string | null;
    resumeUrl: string | null;
    profession: string | null;
  } | null;
  applicationsCount: number;
}

export default function AdminCandidatesPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user && (session.user as any)?.role !== "superadmin") {
      router.push("/dashboard");
      return;
    }

    loadCandidates();
  }, [session, status, router]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter((candidate: Candidate) =>
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (candidate.profile?.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (candidate.profile?.profession?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (candidate.profile?.city?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  }, [searchTerm, candidates]);

  const loadCandidates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/candidates");
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setFilteredCandidates(data);
      } else {
        toast.error("Erro ao carregar candidatos");
      }
    } catch (error) {
      console.error("Error loading candidates:", error);
      toast.error("Erro ao carregar candidatos");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/admin")}
                className="border-primary/20 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-accent">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Gerenciar Candidatos
                  </h1>
                  <p className="text-sm text-muted-foreground">Visualize todos os candidatos do sistema</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              <Users className="mr-1 h-3 w-3" />
              {candidates.length} {candidates.length === 1 ? "Candidato" : "Candidatos"}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search Bar */}
        <Card className="mb-6 border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, profissão ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{candidates.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Com Currículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {candidates.filter(c => c.profile?.resumeUrl).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Candidaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {candidates.reduce((sum, c) => sum + c.applicationsCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Candidates List */}
        {filteredCandidates.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum candidato encontrado</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Tente ajustar sua busca</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="border-2 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {candidate.profile?.fullName || candidate.name || "Nome não informado"}
                        {candidate.emailVerified ? (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <XCircle className="mr-1 h-3 w-3" />
                            Não verificado
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-base">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {candidate.email}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {candidate.applicationsCount} {candidate.applicationsCount === 1 ? "Candidatura" : "Candidaturas"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {candidate.profile?.profession && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{candidate.profile.profession}</span>
                      </div>
                    )}
                    {candidate.profile?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{candidate.profile.phone}</span>
                      </div>
                    )}
                    {(candidate.profile?.city || candidate.profile?.state) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {candidate.profile?.city}
                          {candidate.profile?.city && candidate.profile?.state && ", "}
                          {candidate.profile?.state}
                        </span>
                      </div>
                    )}
                    {candidate.profile?.resumeUrl && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <FileText className="h-4 w-4" />
                        <span>Currículo anexado</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Cadastrado em: {new Date(candidate.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
