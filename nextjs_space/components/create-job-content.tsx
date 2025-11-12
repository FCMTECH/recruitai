
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobCriteria {
  id?: string;
  name: string;
  description: string;
  weight: number;
  required: boolean;
  category: string;
}

const defaultCriteria: JobCriteria[] = [
  {
    name: "Experiência Profissional",
    description: "Anos de experiência na área e relevância das posições anteriores",
    weight: 30,
    required: true,
    category: "experience"
  },
  {
    name: "Habilidades Técnicas",
    description: "Conhecimento em tecnologias, ferramentas e competências específicas",
    weight: 25,
    required: true,
    category: "skills"
  },
  {
    name: "Formação Acadêmica",
    description: "Nível de escolaridade, curso e instituição de ensino",
    weight: 15,
    required: false,
    category: "education"
  },
  {
    name: "Localização",
    description: "Proximidade geográfica ou disponibilidade para trabalho remoto",
    weight: 10,
    required: false,
    category: "location"
  },
  {
    name: "Idiomas",
    description: "Fluência em idiomas necessários para a posição",
    weight: 10,
    required: false,
    category: "languages"
  },
  {
    name: "Competências Comportamentais",
    description: "Soft skills como liderança, comunicação e trabalho em equipe",
    weight: 10,
    required: false,
    category: "other"
  }
];

export default function CreateJobContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    type: "full-time"
  });

  const [criteria, setCriteria] = useState<JobCriteria[]>(defaultCriteria);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [mounted, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCriteriaChange = (index: number, field: keyof JobCriteria, value: string | number | boolean) => {
    setCriteria(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addCriteria = () => {
    setCriteria(prev => [...prev, {
      name: "",
      description: "",
      weight: 5,
      required: false,
      category: "other"
    }]);
  };

  const removeCriteria = (index: number) => {
    setCriteria(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Erro de validação",
        description: "Título da vaga é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro de validação",
        description: "Descrição da vaga é obrigatória",
        variant: "destructive"
      });
      return false;
    }

    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      toast({
        title: "Erro de validação",
        description: `A soma dos pesos deve ser 100%. Atual: ${totalWeight}%`,
        variant: "destructive"
      });
      return false;
    }

    const emptyCriteria = criteria.find(c => !c.name.trim() || !c.description.trim());
    if (emptyCriteria) {
      toast({
        title: "Erro de validação",
        description: "Todos os critérios devem ter nome e descrição",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          criteria
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro ao criar vaga",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Vaga criada com sucesso!",
        description: "Redirecionando para visualização...",
      });

      router.push(`/dashboard/jobs/${data.id}`);

    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  if (!mounted || status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
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
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Criar Nova Vaga</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais da vaga que serão exibidos para os candidatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Desenvolvedor Full Stack Sênior"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição da Vaga *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descreva as principais responsabilidades, o que a empresa faz, benefícios oferecidos..."
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requisitos Principais</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Liste os principais requisitos técnicos e de experiência..."
                  rows={3}
                  value={formData.requirements}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="São Paulo, SP ou Remoto"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Contrato</Label>
                  <select
                    id="type"
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="full-time">Tempo Integral</option>
                    <option value="part-time">Meio Período</option>
                    <option value="contract">Contrato</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Criteria Configuration */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Critérios de Análise da IA</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  totalWeight === 100 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  Total: {totalWeight}%
                </span>
              </CardTitle>
              <CardDescription>
                Configure os critérios que a IA usará para analisar os currículos.
                A soma dos pesos deve ser exatamente 100%.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {criteria.map((criterium, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Critério {index + 1}</h4>
                    {criteria.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Nome do Critério</Label>
                      <Input
                        value={criterium.name}
                        onChange={(e) => handleCriteriaChange(index, "name", e.target.value)}
                        placeholder="Ex: Experiência Profissional"
                      />
                    </div>

                    <div>
                      <Label>Categoria</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={criterium.category}
                        onChange={(e) => handleCriteriaChange(index, "category", e.target.value)}
                      >
                        <option value="experience">Experiência</option>
                        <option value="skills">Habilidades Técnicas</option>
                        <option value="education">Formação</option>
                        <option value="location">Localização</option>
                        <option value="languages">Idiomas</option>
                        <option value="other">Outros</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label>Descrição</Label>
                    <Textarea
                      value={criterium.description}
                      onChange={(e) => handleCriteriaChange(index, "description", e.target.value)}
                      placeholder="Descreva como este critério será avaliado..."
                      rows={2}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Peso (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={criterium.weight}
                        onChange={(e) => handleCriteriaChange(index, "weight", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={criterium.required}
                        onChange={(e) => handleCriteriaChange(index, "required", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`required-${index}`} className="text-sm">
                        Critério obrigatório
                      </Label>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCriteria}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Critério
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || totalWeight !== 100}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Vaga"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
