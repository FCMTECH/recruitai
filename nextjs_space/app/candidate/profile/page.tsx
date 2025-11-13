"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Plus, Trash2, Save, Loader2, User, Briefcase, GraduationCap, Award, BookOpen, FileText, Upload, X } from "lucide-react";
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
  const { data: session } = useSession() || {};
  const email = searchParams?.get("email") || session?.user?.email || "";

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
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
    resumeUrl: "",
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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Apenas arquivos PDF ou DOC/DOCX são permitidos");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB");
      return;
    }

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email);

      const response = await fetch("/api/candidates/upload-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do currículo");
      }

      const data = await response.json();
      setProfile({ ...profile, resumeUrl: data.resumeUrl });
      toast.success("Currículo enviado com sucesso!");
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Erro ao enviar currículo");
    } finally {
      setIsUploadingResume(false);
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

      // Save all sections...
      await Promise.all([
        ...education.map(edu => 
          fetch("/api/candidates/profile/education", {
            method: edu.id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...edu, candidateId }),
          })
        ),
        ...experiences.map(exp => 
          fetch("/api/candidates/profile/experience", {
            method: exp.id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...exp, candidateId }),
          })
        ),
        ...skills.map(skill => 
          fetch("/api/candidates/profile/skills", {
            method: skill.id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...skill, candidateId }),
          })
        ),
        ...courses.map(course => 
          fetch("/api/candidates/profile/courses", {
            method: course.id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...course, candidateId }),
          })
        ),
        ...certifications.map(cert => 
          fetch("/api/candidates/profile/certifications", {
            method: cert.id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...cert, candidateId }),
          })
        ),
      ]);

      toast.success("Perfil salvo com sucesso!");
      if (session?.user?.role === "candidate") {
        router.push("/candidate/dashboard");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  // Add/remove handlers
  const addEducation = () => setEducation([...education, { institution: "", degree: "", fieldOfStudy: "", startDate: "", isCurrent: false }]);
  const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));
  
  const addExperience = () => setExperiences([...experiences, { company: "", position: "", startDate: "", isCurrent: false }]);
  const removeExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index));
  
  const addSkill = () => setSkills([...skills, { name: "", level: "intermediário", category: "técnica" }]);
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));
  
  const addCourse = () => setCourses([...courses, { name: "", institution: "" }]);
  const removeCourse = (index: number) => setCourses(courses.filter((_, i) => i !== index));
  
  const addCertification = () => setCertifications([...certifications, { name: "", issuingOrg: "", issueDate: "" }]);
  const removeCertification = (index: number) => setCertifications(certifications.filter((_, i) => i !== index));

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
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Meu Perfil Profissional
              </h1>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-primary to-accent">
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Salvar Perfil</>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={activeTab === "personal" ? "default" : "outline"} onClick={() => setActiveTab("personal")} size="sm">
            <User className="h-4 w-4 mr-2" />Dados Pessoais
          </Button>
          <Button variant={activeTab === "education" ? "default" : "outline"} onClick={() => setActiveTab("education")} size="sm">
            <GraduationCap className="h-4 w-4 mr-2" />Formação
          </Button>
          <Button variant={activeTab === "experience" ? "default" : "outline"} onClick={() => setActiveTab("experience")} size="sm">
            <Briefcase className="h-4 w-4 mr-2" />Experiência
          </Button>
          <Button variant={activeTab === "skills" ? "default" : "outline"} onClick={() => setActiveTab("skills")} size="sm">
            <Award className="h-4 w-4 mr-2" />Habilidades
          </Button>
          <Button variant={activeTab === "courses" ? "default" : "outline"} onClick={() => setActiveTab("courses")} size="sm">
            <BookOpen className="h-4 w-4 mr-2" />Cursos
          </Button>
          <Button variant={activeTab === "certifications" ? "default" : "outline"} onClick={() => setActiveTab("certifications")} size="sm">
            <FileText className="h-4 w-4 mr-2" />Certificações
          </Button>
        </div>

        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informações básicas sobre você</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resume Upload */}
              <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
                <Label className="text-base font-semibold mb-2 block">Currículo (PDF ou DOC)</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={isUploadingResume}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    disabled={isUploadingResume}
                  >
                    {isUploadingResume ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" />Enviar Currículo</>
                    )}
                  </Button>
                  {profile.resumeUrl && (
                    <span className="text-sm text-green-600 flex items-center gap-2">
                      ✓ Currículo enviado
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tamanho máximo: 10MB. Formatos aceitos: PDF, DOC, DOCX
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input id="fullName" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required disabled={!!email} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input id="dateOfBirth" type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <select id="gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
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
                <Input id="address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input id="zipCode" value={profile.zipCode} onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input id="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." value={profile.linkedinUrl} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="portfolioUrl">Portfólio</Label>
                  <Input id="portfolioUrl" type="url" placeholder="https://..." value={profile.portfolioUrl} onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="githubUrl">GitHub</Label>
                  <Input id="githubUrl" type="url" placeholder="https://github.com/..." value={profile.githubUrl} onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })} />
                </div>
              </div>

              <div>
                <Label htmlFor="summary">Resumo Profissional</Label>
                <Textarea id="summary" rows={4} placeholder="Descreva brevemente sua experiência, objetivos e principais qualificações..." value={profile.summary} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education Tab */}
        {activeTab === "education" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Formação Acadêmica</CardTitle>
                  <CardDescription>Adicione seus cursos de graduação, pós-graduação e técnicos</CardDescription>
                </div>
                <Button onClick={addEducation} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma formação adicionada ainda</p>
              ) : (
                education.map((edu, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeEducation(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Instituição *</Label>
                        <Input value={edu.institution} onChange={(e) => { const newEdu = [...education]; newEdu[index].institution = e.target.value; setEducation(newEdu); }} required />
                      </div>
                      <div>
                        <Label>Grau *</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={edu.degree} onChange={(e) => { const newEdu = [...education]; newEdu[index].degree = e.target.value; setEducation(newEdu); }}>
                          <option value="">Selecione</option>
                          <option value="Ensino Médio">Ensino Médio</option>
                          <option value="Técnico">Técnico</option>
                          <option value="Tecnólogo">Tecnólogo</option>
                          <option value="Bacharelado">Bacharelado</option>
                          <option value="Licenciatura">Licenciatura</option>
                          <option value="Especialização">Especialização</option>
                          <option value="MBA">MBA</option>
                          <option value="Mestrado">Mestrado</option>
                          <option value="Doutorado">Doutorado</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Área de Estudo *</Label>
                      <Input value={edu.fieldOfStudy} onChange={(e) => { const newEdu = [...education]; newEdu[index].fieldOfStudy = e.target.value; setEducation(newEdu); }} required />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Data de Início</Label>
                        <Input type="month" value={edu.startDate} onChange={(e) => { const newEdu = [...education]; newEdu[index].startDate = e.target.value; setEducation(newEdu); }} />
                      </div>
                      <div>
                        <Label>Data de Conclusão</Label>
                        <Input type="month" value={edu.endDate || ""} onChange={(e) => { const newEdu = [...education]; newEdu[index].endDate = e.target.value; setEducation(newEdu); }} disabled={edu.isCurrent} />
                      </div>
                      <div className="flex items-center pt-8">
                        <input type="checkbox" id={`edu-current-${index}`} checked={edu.isCurrent} onChange={(e) => { const newEdu = [...education]; newEdu[index].isCurrent = e.target.checked; if (e.target.checked) newEdu[index].endDate = ""; setEducation(newEdu); }} className="mr-2" />
                        <Label htmlFor={`edu-current-${index}`} className="cursor-pointer">Cursando</Label>
                      </div>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea rows={2} value={edu.description || ""} onChange={(e) => { const newEdu = [...education]; newEdu[index].description = e.target.value; setEducation(newEdu); }} placeholder="Principais atividades, projetos e conquistas..." />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Experience Tab */}
        {activeTab === "experience" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Experiência Profissional</CardTitle>
                  <CardDescription>Adicione suas experiências de trabalho</CardDescription>
                </div>
                <Button onClick={addExperience} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {experiences.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma experiência adicionada ainda</p>
              ) : (
                experiences.map((exp, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeExperience(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Empresa *</Label>
                        <Input value={exp.company} onChange={(e) => { const newExp = [...experiences]; newExp[index].company = e.target.value; setExperiences(newExp); }} required />
                      </div>
                      <div>
                        <Label>Cargo *</Label>
                        <Input value={exp.position} onChange={(e) => { const newExp = [...experiences]; newExp[index].position = e.target.value; setExperiences(newExp); }} required />
                      </div>
                    </div>
                    <div>
                      <Label>Localização</Label>
                      <Input value={exp.location || ""} onChange={(e) => { const newExp = [...experiences]; newExp[index].location = e.target.value; setExperiences(newExp); }} placeholder="Cidade, Estado" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Data de Início</Label>
                        <Input type="month" value={exp.startDate} onChange={(e) => { const newExp = [...experiences]; newExp[index].startDate = e.target.value; setExperiences(newExp); }} />
                      </div>
                      <div>
                        <Label>Data de Saída</Label>
                        <Input type="month" value={exp.endDate || ""} onChange={(e) => { const newExp = [...experiences]; newExp[index].endDate = e.target.value; setExperiences(newExp); }} disabled={exp.isCurrent} />
                      </div>
                      <div className="flex items-center pt-8">
                        <input type="checkbox" id={`exp-current-${index}`} checked={exp.isCurrent} onChange={(e) => { const newExp = [...experiences]; newExp[index].isCurrent = e.target.checked; if (e.target.checked) newExp[index].endDate = ""; setExperiences(newExp); }} className="mr-2" />
                        <Label htmlFor={`exp-current-${index}`} className="cursor-pointer">Trabalho Atual</Label>
                      </div>
                    </div>
                    <div>
                      <Label>Descrição das Atividades</Label>
                      <Textarea rows={3} value={exp.description || ""} onChange={(e) => { const newExp = [...experiences]; newExp[index].description = e.target.value; setExperiences(newExp); }} placeholder="Descreva suas responsabilidades, conquistas e projetos..." />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Habilidades</CardTitle>
                  <CardDescription>Adicione suas competências técnicas e comportamentais</CardDescription>
                </div>
                <Button onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma habilidade adicionada ainda</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                      <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeSkill(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <div>
                        <Label>Habilidade *</Label>
                        <Input value={skill.name} onChange={(e) => { const newSkills = [...skills]; newSkills[index].name = e.target.value; setSkills(newSkills); }} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nível *</Label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={skill.level} onChange={(e) => { const newSkills = [...skills]; newSkills[index].level = e.target.value; setSkills(newSkills); }}>
                            <option value="básico">Básico</option>
                            <option value="intermediário">Intermediário</option>
                            <option value="avançado">Avançado</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                        <div>
                          <Label>Anos de Exp.</Label>
                          <Input type="number" min="0" value={skill.yearsOfExperience || ""} onChange={(e) => { const newSkills = [...skills]; newSkills[index].yearsOfExperience = parseInt(e.target.value) || undefined; setSkills(newSkills); }} />
                        </div>
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={skill.category || "técnica"} onChange={(e) => { const newSkills = [...skills]; newSkills[index].category = e.target.value; setSkills(newSkills); }}>
                          <option value="técnica">Técnica</option>
                          <option value="comportamental">Comportamental</option>
                          <option value="idioma">Idioma</option>
                          <option value="ferramenta">Ferramenta</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cursos Complementares</CardTitle>
                  <CardDescription>Adicione cursos livres, workshops e treinamentos</CardDescription>
                </div>
                <Button onClick={addCourse} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum curso adicionado ainda</p>
              ) : (
                courses.map((course, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeCourse(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Curso *</Label>
                        <Input value={course.name} onChange={(e) => { const newCourses = [...courses]; newCourses[index].name = e.target.value; setCourses(newCourses); }} required />
                      </div>
                      <div>
                        <Label>Instituição *</Label>
                        <Input value={course.institution} onChange={(e) => { const newCourses = [...courses]; newCourses[index].institution = e.target.value; setCourses(newCourses); }} required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Data de Conclusão</Label>
                        <Input type="month" value={course.completionDate || ""} onChange={(e) => { const newCourses = [...courses]; newCourses[index].completionDate = e.target.value; setCourses(newCourses); }} />
                      </div>
                      <div>
                        <Label>Carga Horária (horas)</Label>
                        <Input type="number" min="0" value={course.workload || ""} onChange={(e) => { const newCourses = [...courses]; newCourses[index].workload = parseInt(e.target.value) || undefined; setCourses(newCourses); }} />
                      </div>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea rows={2} value={course.description || ""} onChange={(e) => { const newCourses = [...courses]; newCourses[index].description = e.target.value; setCourses(newCourses); }} placeholder="Principais tópicos abordados..." />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Certifications Tab */}
        {activeTab === "certifications" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Certificações</CardTitle>
                  <CardDescription>Adicione certificações e licenças profissionais</CardDescription>
                </div>
                <Button onClick={addCertification} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {certifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma certificação adicionada ainda</p>
              ) : (
                certifications.map((cert, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => removeCertification(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome da Certificação *</Label>
                        <Input value={cert.name} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].name = e.target.value; setCertifications(newCerts); }} required />
                      </div>
                      <div>
                        <Label>Organização Emissora *</Label>
                        <Input value={cert.issuingOrg} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].issuingOrg = e.target.value; setCertifications(newCerts); }} required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Data de Emissão</Label>
                        <Input type="month" value={cert.issueDate} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].issueDate = e.target.value; setCertifications(newCerts); }} />
                      </div>
                      <div>
                        <Label>Data de Expiração</Label>
                        <Input type="month" value={cert.expiryDate || ""} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].expiryDate = e.target.value; setCertifications(newCerts); }} />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>ID da Credencial</Label>
                        <Input value={cert.credentialId || ""} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].credentialId = e.target.value; setCertifications(newCerts); }} placeholder="Ex: ABC123456" />
                      </div>
                      <div>
                        <Label>URL da Credencial</Label>
                        <Input type="url" value={cert.credentialUrl || ""} onChange={(e) => { const newCerts = [...certifications]; newCerts[index].credentialUrl = e.target.value; setCertifications(newCerts); }} placeholder="https://..." />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
