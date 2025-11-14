
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, Save, Loader2, User, Mail, Building, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  jobLimit: number;
  features: string[];
}

interface Subscription {
  id: string;
  status: string;
  plan: Plan;
  startDate: string;
  trialEndDate?: string;
  jobsCreatedThisMonth: number;
}

export default function CompanyProfilePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    companyName: "",
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role !== "company") {
      router.push("/dashboard");
      return;
    }

    loadProfile();
    loadSubscription();
    loadAvailablePlans();
  }, [session, status, router]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/dashboard/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          companyName: data.companyName || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/current");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const data = await response.json();
        setAvailablePlans(data);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    }
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email || !profile.companyName) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast.success("Perfil atualizado com sucesso!");
      } else {
        throw new Error("Erro ao salvar perfil");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setIsChangingPlan(true);
    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error("Erro ao iniciar checkout");
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      toast.error("Erro ao alterar plano");
      setIsChangingPlan(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      trial: { label: "Período de Teste", variant: "secondary" },
      active: { label: "Ativo", variant: "default" },
      past_due: { label: "Pagamento Pendente", variant: "destructive" },
      canceled: { label: "Cancelado", variant: "outline" },
      expired: { label: "Expirado", variant: "outline" },
    };
    return statusMap[status] || { label: status, variant: "outline" };
  };

  if (isLoading || status === "loading") {
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Perfil da Empresa
                </h1>
              </div>
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

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Profile Information */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>Gerencie as informações da sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Responsável *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Nome completo"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="empresa@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  placeholder="Nome da sua empresa"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        {subscription && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Plano Atual
              </CardTitle>
              <CardDescription>Informações sobre seu plano de assinatura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{subscription.plan.displayName}</h3>
                    <Badge variant={getStatusBadge(subscription.status).variant}>
                      {getStatusBadge(subscription.status).label}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    R$ {subscription.plan.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Limite: {subscription.plan.jobLimit} vagas/mês</p>
                    <p>Criadas este mês: {subscription.jobsCreatedThisMonth}</p>
                    {subscription.trialEndDate && (
                      <p>Período de teste até: {new Date(subscription.trialEndDate).toLocaleDateString("pt-BR")}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recursos Incluídos:</h4>
                <ul className="space-y-2">
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Alterar Plano</CardTitle>
            <CardDescription>Escolha um plano que melhor atenda às suas necessidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePlans
                .filter((plan) => plan.name !== "free" && plan.id !== subscription?.plan.id)
                .map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                      <div className="text-2xl font-bold text-primary">
                        R$ {plan.price.toFixed(2)}
                        <span className="text-sm font-normal text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Até {plan.jobLimit} vagas/mês
                      </p>
                      <Button
                        onClick={() => handleChangePlan(plan.id)}
                        disabled={isChangingPlan}
                        className="w-full"
                        variant="outline"
                      >
                        {isChangingPlan ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</>
                        ) : (
                          "Selecionar Plano"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
