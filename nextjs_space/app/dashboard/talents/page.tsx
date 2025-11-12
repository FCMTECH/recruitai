"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Search, MapPin, GraduationCap, Briefcase, Award, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CandidateProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  city?: string;
  state?: string;
  summary?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
  }>;
  experiences: Array<{
    company: string;
    position: string;
    isCurrent: boolean;
  }>;
  skills: Array<{
    name: string;
    level: string;
    category?: string;
  }>;
  _count: {
    applications: number;
  };
}

export default function TalentBankPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    degree: "",
    skillCategory: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role === "company") {
      fetchProfiles();
    }
  }, [session, page, searchQuery, filters]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: "12",
        ...filters,
      });

      const response = await fetch(`/api/candidates/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error("Erro ao buscar candidatos");
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Erro ao carregar banco de talentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProfiles();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (session?.user?.role !== "company") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Acesso restrito a empresas</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Banco de Talentos
              </h1>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost">Voltar ao Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search and Filters */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Buscar Candidatos</CardTitle>
            <CardDescription>
              Pesquise no banco de currículos da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por nome, email ou palavras-chave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  placeholder="Cidade"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
                <Input
                  placeholder="Estado"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                />
                <Input
                  placeholder="Formação"
                  value={filters.degree}
                  onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.skillCategory}
                  onChange={(e) => setFilters({ ...filters, skillCategory: e.target.value })}
                >
                  <option value="">Todas Categorias</option>
                  <option value="técnica">Técnicas</option>
                  <option value="comportamental">Comportamentais</option>
                  <option value="idioma">Idiomas</option>
                </select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum candidato encontrado</p>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros de busca
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {profiles.map((profile) => (
                <Card key={profile.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{profile.fullName}</CardTitle>
                    <CardDescription className="space-y-1">
                      {profile.city && profile.state && (
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {profile.city}, {profile.state}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {profile._count.applications} candidaturas na plataforma
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Latest Education */}
                    {profile.education.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">Formação</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {profile.education[0].degree} em {profile.education[0].fieldOfStudy}
                          <br />
                          {profile.education[0].institution}
                        </p>
                      </div>
                    )}

                    {/* Latest Experience */}
                    {profile.experiences.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">Experiência</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {profile.experiences[0].position}
                          <br />
                          {profile.experiences[0].company}
                          {profile.experiences[0].isCurrent && " (Atual)"}
                        </p>
                      </div>
                    )}

                    {/* Top Skills */}
                    {profile.skills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">Habilidades</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 rounded-full text-xs bg-muted"
                            >
                              {skill.name}
                            </span>
                          ))}
                          {profile.skills.length > 3 && (
                            <span className="px-2 py-1 rounded-full text-xs bg-muted">
                              +{profile.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {profile.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {profile.summary}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/talents/${profile.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </Button>
                      </Link>
                      {profile.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(profile.email);
                            toast.success("Email copiado!");
                          }}
                        >
                          📧
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={i}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
