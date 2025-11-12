"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Plus, Trash2, Save, Loader2, User, Briefcase, GraduationCap, Award, BookOpen, FileText } from "lucide-react";
import { toast } from "sonner";

interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

interface Experience {
  id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

interface Skill {
  id?: string;
  name: string;
  level: string;
  yearsOfExperience?: number;
  category?: string;
}

interface Course {
  id?: string;
  name: string;
  institution: string;
  completionDate?: string;
  workload?: number;
  description?: string;
}

interface Certification {
  id?: string;
  name: string;
  issuingOrg: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export default function CandidateProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Personal Info
  const [profile, setProfile] = useState({
    email: email,
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brasil",
    linkedinUrl: "",
    portfolioUrl: "",
    githubUrl: "",
    summary: "",
  });

  // Collections
  const [education, setEducation] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    if (email) {
      fetchProfile();
    }
  }, [email]);

  const fetchProfile = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/candidates/profile?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfile({
            ...profile,
            ...data,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
          });
          setEducation(data.education || []);
          setExperiences(data.experiences || []);
          setSkills(data.skills || []);
          setCourses(data.courses || []);
          setCertifications(data.certifications || []);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.email || !profile.fullName) {
      toast.error("Email e nome completo são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      // Save profile
      const profileResponse = await fetch("/api/candidates/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!profileResponse.ok) {
        throw new Error("Erro ao salvar perfil");
      }

      const profileData = await profileResponse.json();
      const candidateId = profileData.id;

      // Save education
      for (const edu of education) {
        if (edu.id) {
          await fetch("/api/candidates/profile/education", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...edu, candidateId }),
          });
        } else {
          await fetch("/api/candidates/profile/education", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...edu, candidateId }),
          });
        }
      }

      // Save experiences
      for (const exp of experiences) {
        if (exp.id) {
          await fetch("/api/candidates/profile/experience", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...exp, candidateId }),
          });
        } else {
          await fetch("/api/candidates/profile/experience", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...exp, candidateId }),
          });
        }
      }

      // Save skills
      for (const skill of skills) {
        if (skill.id) {
          await fetch("/api/candidates/profile/skills", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...skill, candidateId }),
          });
        } else {
          await fetch("/api/candidates/profile/skills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...skill, candidateId }),
          });
        }
      }

      // Save courses
      for (const course of courses) {
        if (course.id) {
          await fetch("/api/candidates/profile/courses", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...course, candidateId }),
          });
        } else {
          await fetch("/api/candidates/profile/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...course, candidateId }),
          });
        }
      }

      // Save certifications
      for (const cert of certifications) {
        if (cert.id) {
          await fetch("/api/candidates/profile/certifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...cert, candidateId }),
          });
        } else {
          await fetch("/api/candidates/profile/certifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...cert, candidateId }),
          });
        }
      }

      toast.success("Perfil salvo com sucesso!");
      router.push(`/apply?email=${encodeURIComponent(profile.email)}`);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      isCurrent: false,
    }]);
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      company: "",
      position: "",
      startDate: "",
      isCurrent: false,
    }]);
  };

  const addSkill = () => {
    setSkills([...skills, {
      name: "",
      level: "intermediário",
      category: "técnica",
    }]);
  };

  const addCourse = () => {
    setCourses([...courses, {
      name: "",
      institution: "",
    }]);
  };

  const addCertification = () => {
    setCertifications([...certifications, {
      name: "",
      issuingOrg: "",
      issueDate: "",
    }]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Meu Perfil Profissional
              </h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Perfil
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === "personal" ? "default" : "outline"}
            onClick={() => setActiveTab("personal")}
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            Dados Pessoais
          </Button>
          <Button
            variant={activeTab === "education" ? "default" : "outline"}
            onClick={() => setActiveTab("education")}
            size="sm"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Formação
          </Button>
          <Button
            variant={activeTab === "experience" ? "default" : "outline"}
            onClick={() => setActiveTab("experience")}
            size="sm"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Experiência
          </Button>
          <Button
            variant={activeTab === "skills" ? "default" : "outline"}
            onClick={() => setActiveTab("skills")}
            size="sm"
          >
            <Award className="h-4 w-4 mr-2" />
            Habilidades
          </Button>
          <Button
            variant={activeTab === "courses" ? "default" : "outline"}
            onClick={() => setActiveTab("courses")}
            size="sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Cursos
          </Button>
          <Button
            variant={activeTab === "certifications" ? "default" : "outline"}
            onClick={() => setActiveTab("certifications")}
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Certificações
          </Button>
        </div>

        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informações básicas sobre você</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                    disabled={!!email}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <select
                    id="gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro-nao-dizer">Prefiro não dizer</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={profile.zipCode}
                    onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="portfolioUrl">Portfólio</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    placeholder="https://..."
                    value={profile.portfolioUrl}
                    onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="githubUrl">GitHub</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    placeholder="https://github.com/..."
                    value={profile.githubUrl}
                    onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="summary">Resumo Profissional</Label>
                <Textarea
                  id="summary"
                  rows={4}
                  placeholder="Descreva brevemente sua experiência, objetivos e principais qualificações..."
                  value={profile.summary}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other tabs will be continued in the next part... */}
        {activeTab !== "personal" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Por favor, salve seus dados pessoais primeiro.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
