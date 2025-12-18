"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Plus, Trash2, ArrowLeft, Loader2, MoveUp, MoveDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobCriteria {
  id?: string;
  criterion: string;
  description?: string;
  weight: number;
}

interface JobStage {
  id?: string;
  name: string;
  description: string;
  order: number;
}

const defaultCriteria: JobCriteria[] = [
  {
    criterion: "Experiência Profissional",
    description: "Anos de experiência na área e relevância das posições anteriores",
    weight: 30
  },
  {
    criterion: "Habilidades Técnicas",
    description: "Conhecimento em tecnologias, ferramentas e competências específicas",
    weight: 25
  },
  {
    criterion: "Formação Acadêmica",
    description: "Nível de escolaridade, curso e instituição de ensino",
    weight: 15
  },
  {
    criterion: "Localização",
    description: "Proximidade geográfica ou disponibilidade para trabalho remoto",
    weight: 10
  },
  {
    criterion: "Idiomas",
    description: "Fluência em idiomas necessários para a posição",
    weight: 10
  },
  {
    criterion: "Competências Comportamentais",
    description: "Soft skills como liderança, comunicação e trabalho em equipe",
    weight: 10
  }
];

const defaultStages: JobStage[] = [
  { name: "Triagem de Currículo", description: "Análise inicial do currículo pela IA", order: 0 },
  { name: "Entrevista com RH", description: "Entrevista inicial com o time de Recursos Humanos", order: 1 },
  { name: "Entrevista Técnica", description: "Avaliação técnica com o time da área", order: 2 },
  { name: "Entrevista Final", description: "Entrevista com gestores e tomada de decisão", order: 3 },
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
    country: "Brasil",
    state: "",
    city: "",
    type: "full-time",
    workMode: "presencial"
  });

  const [criteria, setCriteria] = useState<JobCriteria[]>(defaultCriteria);
  const [stages, setStages] = useState<JobStage[]>(defaultStages);

  // Location data
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await fetch('/api/locations/countries');
        const data = await res.json();
        setCountries(data);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!formData.country) {
        setStates([]);
        return;
      }
      try {
        const countryCode = countries.find(c => c.name === formData.country)?.code;
        if (countryCode) {
          const res = await fetch(`/api/locations/states?country=${countryCode}`);
          const data = await res.json();
          setStates(data);
        }
      } catch (error) {
        console.error('Error loading states:', error);
      }
    };
    if (countries.length > 0) {
      loadStates();
    }
  }, [formData.country, countries]);

  // Load cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (!formData.country || !formData.state) {
        setCities([]);
        return;
      }
      try {
        const countryCode = countries.find(c => c.name === formData.country)?.code;
        const stateCode = states.find(s => s.name === formData.state)?.code;
        if (countryCode && stateCode) {
          const res = await fetch(`/api/locations/cities?country=${countryCode}&state=${stateCode}`);
          const data = await res.json();
          setCities(data);
        }
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    };
    if (countries.length > 0 && states.length > 0) {
      loadCities();
    }
  }, [formData.state, formData.country, countries, states]);

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
      criterion: "",
      description: "",
      weight: 5
    }]);
  };

  const removeCriteria = (index: number) => {
    setCriteria(prev => prev.filter((_, i) => i !== index));
  };

  // Funções para gerenciar fases
  const handleStageChange = (index: number, field: keyof JobStage, value: string | number) => {
    setStages(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const addStage = () => {
    setStages(prev => [...prev, {
      name: "",
      description: "",
      order: prev.length
    }]);
  };

  const removeStage = (index: number) => {
    setStages(prev => prev.filter((_, i) => i !== index).map((stage, i) => ({ ...stage, order: i })));
  };

  const moveStageUp = (index: number) => {
    if (index === 0) return;
    setStages(prev => {
      const newStages = [...prev];
      [newStages[index], newStages[index - 1]] = [newStages[index - 1], newStages[index]];
      return newStages.map((stage, i) => ({ ...stage, order: i }));
    });
  };

  const moveStageDown = (index: number) => {
    if (index === stages.length - 1) return;
    setStages(prev => {
      const newStages = [...prev];
      [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
      return newStages.map((stage, i) => ({ ...stage, order: i }));
    });
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

    const totalWeight = criteria.reduce((sum: number, c: any) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      toast({
        title: "Erro de validação",
        description: `A soma dos pesos deve ser 100%. Atual: ${totalWeight}%`,
        variant: "destructive"
      });
      return false;
    }

    const emptyCriteria = criteria.find(c => !c.criterion.trim());
    if (emptyCriteria) {
      toast({
        title: "Erro de validação",
        description: "Todos os critérios devem ter um nome",
        variant: "destructive"
      });
      return false;
    }

    const emptyStage = stages.find(s => !s.name.trim());
    if (emptyStage) {
      toast({
        title: "Erro de validação",
        description: "Todas as fases devem ter um nome",
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
      // Criar vaga
      const jobResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          criteria
        }),
      });

      const jobData = await jobResponse.json();

      if (!jobResponse.ok) {
        toast({
          title: "Erro ao criar vaga",
          description: jobData.error,
          variant: "destructive",
        });
        return;
      }

      // Criar fases
      for (const stage of stages) {
        await fetch(`/api/jobs/${jobData.id}/stages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stage),
        });
      }

      toast({
        title: "Vaga criada com sucesso!",
        description: "Redirecionando para visualização...",
      });

      router.push(`/dashboard/jobs/${jobData.id}`);

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

  const totalWeight = criteria.reduce((sum: number, c: any) => sum + c.weight, 0);

  if (!mounted || status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
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
            <Brain className="h-8 w-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Criar Nova Vaga
            </span>
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

              {/* Localização Hierárquica */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country">País</Label>
                  <select
                    id="country"
                    name="country"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.country}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData(prev => ({ ...prev, state: "", city: "" }));
                    }}
                  >
                    <option value="">Selecione um país</option>
                    {countries.map((country: any) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">Estado / Região</Label>
                    <select
                      id="state"
                      name="state"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.state}
                      onChange={(e) => {
                        handleInputChange(e);
                        setFormData(prev => ({ ...prev, city: "" }));
                      }}
                      disabled={!formData.country || states.length === 0}
                    >
                      <option value="">Selecione um estado</option>
                      {states.map((state: any) => (
                        <option key={state.code} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <select
                      id="city"
                      name="city"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!formData.state || cities.length === 0}
                    >
                      <option value="">Selecione uma cidade</option>
                      {cities.map((city: string) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="type">Tipo de Contratação</Label>
                <select
                  id="type"
                  name="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="contract">Contrato</option>
                </select>
              </div>

              <div>
                <Label htmlFor="workMode">Modalidade de Trabalho</Label>
                <select
                  id="workMode"
                  name="workMode"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.workMode}
                  onChange={handleInputChange}
                >
                  <option value="presencial">Presencial (100%)</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="remoto">Remoto (100%)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Stages Management */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Fases do Processo Seletivo
              </CardTitle>
              <CardDescription>
                Defina as etapas que os candidatos passarão durante o processo seletivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stages.map((stage, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Fase {index + 1}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStageUp(index)}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStageDown(index)}
                        disabled={index === stages.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      {stages.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStage(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor={`stage-name-${index}`}>Nome da Fase *</Label>
                      <Input
                        id={`stage-name-${index}`}
                        placeholder="Ex: Entrevista com RH"
                        value={stage.name}
                        onChange={(e) => handleStageChange(index, "name", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor={`stage-description-${index}`}>Descrição (opcional)</Label>
                      <Textarea
                        id={`stage-description-${index}`}
                        placeholder="Descreva o que acontece nesta fase..."
                        rows={2}
                        value={stage.description || ""}
                        onChange={(e) => handleStageChange(index, "description", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addStage}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Fase
              </Button>
            </CardContent>
          </Card>

          {/* AI Criteria */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Critérios de Avaliação por IA
              </CardTitle>
              <CardDescription>
                Configure os critérios que a IA usará para avaliar candidatos automaticamente.
                A soma dos pesos deve totalizar 100%.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Critério {index + 1}
                    </span>
                    {criteria.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`criterion-name-${index}`}>Nome do Critério *</Label>
                    <Input
                      id={`criterion-name-${index}`}
                      placeholder="Ex: Experiência Profissional"
                      value={criterion.criterion}
                      onChange={(e) => handleCriteriaChange(index, "criterion", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`criterion-description-${index}`}>Descrição</Label>
                    <Textarea
                      id={`criterion-description-${index}`}
                      placeholder="Descreva o que será avaliado neste critério..."
                      rows={2}
                      value={criterion.description || ""}
                      onChange={(e) => handleCriteriaChange(index, "description", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`criterion-weight-${index}`}>Peso (%)</Label>
                    <Input
                      id={`criterion-weight-${index}`}
                      type="number"
                      min="0"
                      max="100"
                      value={criterion.weight}
                      onChange={(e) => handleCriteriaChange(index, "weight", parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCriteria}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Critério
                </Button>

                <div className={`text-sm font-medium ${totalWeight === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  Total: {totalWeight}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || totalWeight !== 100}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Vaga
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
