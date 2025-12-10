
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Check, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  jobLimit: number;
  features: string[];
  isActive: boolean;
}

export default function OnboardingPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role !== "company") {
      router.push("/dashboard");
      return;
    }

    fetchPlans();
    checkExistingSubscription();
  }, [session, status, router]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/current");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Já tem plano, redirecionar para dashboard
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleSelectPlan = async (planId: string, planName: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      // Se for plano gratuito, criar trial
      if (planName.toLowerCase() === "free" || planName.toLowerCase() === "gratuito") {
        const response = await fetch("/api/subscriptions/create-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });

        if (response.ok) {
          toast.success("Plano gratuito ativado! Aproveite seus 7 dias de teste.");
          router.push("/dashboard");
        } else {
          toast.error("Erro ao ativar plano gratuito");
        }
      } else {
        // Redirecionar para checkout do Stripe
        const response = await fetch("/api/checkout/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });

        if (response.ok) {
          const { url } = await response.json();
          window.location.href = url;
        } else {
          toast.error("Erro ao processar pagamento");
        }
      }
    } catch (error) {
      console.error("Error selecting plan:", error);
      toast.error("Erro ao processar solicitação");
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RecruitAI
              </h1>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Bem-vindo ao RecruitAI!</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Escolha seu Plano</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Selecione o plano ideal para suas necessidades de recrutamento e comece a contratar os melhores talentos
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center text-muted-foreground">
            Nenhum plano disponível no momento
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isFreePlan =
                plan.name.toLowerCase() === "free" || plan.name.toLowerCase() === "gratuito";
              const isMostPopular = plan.name.toLowerCase() === "silver" || plan.name.toLowerCase() === "prata";

              return (
                <Card
                  key={plan.id}
                  className={`border-2 transition-all hover:shadow-xl ${
                    isMostPopular
                      ? "border-primary shadow-lg scale-105"
                      : "border-border"
                  }`}
                >
                  <CardHeader>
                    {isMostPopular && (
                      <Badge className="w-fit mb-2 bg-gradient-to-r from-primary to-accent">
                        Mais Popular
                      </Badge>
                    )}
                    {isFreePlan && (
                      <Badge variant="outline" className="w-fit mb-2 bg-accent/10">
                        Teste Grátis
                      </Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? "Grátis" : `R$ ${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground">/mês</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {plan.jobLimit === -1
                            ? "Vagas ilimitadas"
                            : `Até ${plan.jobLimit} vagas/mês`}
                        </span>
                      </div>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {isFreePlan && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">7 dias de teste</span>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleSelectPlan(plan.id, plan.name)}
                      disabled={isProcessing && selectedPlan !== plan.id}
                      className={`w-full ${
                        isMostPopular
                          ? "bg-gradient-to-r from-primary to-accent"
                          : ""
                      }`}
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : isFreePlan ? (
                        "Começar Teste Grátis"
                      ) : (
                        "Selecionar Plano"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Precisa de um plano personalizado?
          </p>
          <Button variant="outline">Entre em contato</Button>
        </div>
      </div>
    </div>
  );
}
