
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  MapPin,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
  FileCheck,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CandidateProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  summary?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  photoUrl?: string;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }>;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    location?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: string;
    category?: string;
    yearsOfExperience?: number;
  }>;
  courses: Array<{
    id: string;
    name: string;
    institution: string;
    completionDate?: string;
    workload?: number;
    description?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate?: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  _count: {
    applications: number;
  };
}

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.role === "company") {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/candidates/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        toast.error("Erro ao carregar perfil do candidato");
        router.push("/dashboard/talents");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Erro ao carregar perfil do candidato");
      router.push("/dashboard/talents");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "avançado":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "intermediário":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "básico":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Perfil não encontrado</p>
          <Button onClick={() => router.push("/dashboard/talents")} className="mt-4">
            Voltar ao Banco de Talentos
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
            <div className="flex items-center gap-4">
              <Link href="/dashboard/talents">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
                <h1 className="text-xl font-bold">Perfil do Candidato</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{profile.fullName}</h2>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${profile.email}`} className="hover:text-primary">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.city && profile.state && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {profile.city}, {profile.state}
                      </span>
                    </div>
                  )}
                  {profile.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(profile.dateOfBirth)}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Portfólio
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Summary */}
                {profile.summary && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground">{profile.summary}</p>
                  </div>
                )}

                <div className="mt-4">
                  <Badge variant="outline">
                    {profile._count.applications} candidaturas na plataforma
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Education */}
          {profile.education.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <CardTitle>Formação Acadêmica</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={edu.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div>
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                      <p className="text-sm font-medium mt-1">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(edu.startDate)} -{" "}
                        {edu.isCurrent ? "Cursando" : formatDate(edu.endDate)}
                      </p>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experiences.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle>Experiência Profissional</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.experiences.map((exp, index) => (
                  <div key={exp.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div>
                      <h4 className="font-semibold">{exp.position}</h4>
                      <p className="text-sm font-medium">{exp.company}</p>
                      {exp.location && (
                        <p className="text-xs text-muted-foreground">{exp.location}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.isCurrent ? "Atual" : formatDate(exp.endDate)}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <CardTitle>Habilidades</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className={getLevelColor(skill.level)}
                    >
                      {skill.name}
                      {skill.level && ` • ${skill.level}`}
                      {skill.yearsOfExperience && ` • ${skill.yearsOfExperience} anos`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses */}
          {profile.courses.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Cursos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.courses.map((course, index) => (
                  <div key={course.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div>
                      <h4 className="font-semibold">{course.name}</h4>
                      <p className="text-sm font-medium">{course.institution}</p>
                      {course.completionDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Concluído em {formatDate(course.completionDate)}
                        </p>
                      )}
                      {course.workload && (
                        <p className="text-xs text-muted-foreground">
                          Carga horária: {course.workload}h
                        </p>
                      )}
                      {course.description && (
                        <p className="text-sm text-muted-foreground mt-2">{course.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {profile.certifications.length > 0 && (
            <Card className="border-0 shadow-lg lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <CardTitle>Certificações</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.certifications.map((cert) => (
                    <Card key={cert.id} className="border">
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-sm font-medium text-muted-foreground">{cert.issuer}</p>
                        {cert.issueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Emitida em {formatDate(cert.issueDate)}
                            {cert.expirationDate && ` • Expira em ${formatDate(cert.expirationDate)}`}
                          </p>
                        )}
                        {cert.credentialId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ID: {cert.credentialId}
                          </p>
                        )}
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          >
                            Ver credencial
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
