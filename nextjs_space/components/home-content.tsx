

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, Zap, Target, TrendingUp, Shield } from "lucide-react";

export default function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [mounted, session, status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 animate-pulse">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-lg font-medium text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary" />
              <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RecruitAI
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push("/pricing")}
              className="text-slate-700 hover:text-primary"
            >
              Planos
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/signin")}
              className="text-slate-700 hover:text-primary"
            >
              Entrar
            </Button>
            <Button
              onClick={() => router.push("/auth/signup")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
            >
              Começar Agora
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-20 max-w-7xl">
        <div className="text-center max-w-4xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Recrutamento
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Inteligente e Preciso
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Transforme seu processo seletivo com análise automática de currículos, 
            scoring inteligente e insights precisos para encontrar os melhores talentos.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/auth/signup")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-xl hover:shadow-2xl px-8 py-6 text-lg"
            >
              <Zap className="mr-2 h-5 w-5" />
              Iniciar Teste Grátis
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/apply")}
              className="px-8 py-6 text-lg border-2 hover:border-primary hover:text-primary"
            >
              Enviar Currículo
            </Button>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            ✨ 7 dias grátis • Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Tudo que você precisa em uma plataforma
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Funcionalidades poderosas para otimizar cada etapa do seu processo de recrutamento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Análise Inteligente",
              description: "IA avançada analisa currículos e calcula compatibilidade automática com explicações detalhadas.",
              color: "text-primary"
            },
            {
              icon: Zap,
              title: "Processamento Rápido",
              description: "Análise completa de currículos em segundos, economizando horas do seu time de RH.",
              color: "text-accent"
            },
            {
              icon: TrendingUp,
              title: "Scoring Preciso",
              description: "Sistema de pontuação baseado nos critérios específicos de cada vaga com pesos personalizáveis.",
              color: "text-violet-600"
            },
            {
              icon: Brain,
              title: "Insights Avançados",
              description: "Visualize padrões, tendências e métricas detalhadas sobre candidatos e processos.",
              color: "text-primary"
            },
            {
              icon: Shield,
              title: "Dados Seguros",
              description: "Segurança de dados com criptografia e conformidade total com LGPD.",
              color: "text-accent"
            },
            {
              icon: Sparkles,
              title: "Interface Intuitiva",
              description: "Design moderno e fácil de usar, sem necessidade de treinamento complexo.",
              color: "text-violet-600"
            }
          ].map((feature, index) => (
            <Card 
              key={index} 
              className="group border-slate-200 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur"
            >
              <CardContent className="p-8">
                <div className={`inline-flex p-3 rounded-xl bg-slate-50 group-hover:bg-primary/10 transition-colors mb-4`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20 max-w-7xl">
        <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-white">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-white/80 text-lg">Precisão na Análise</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10x</div>
              <div className="text-white/80 text-lg">Mais Rápido</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-white/80 text-lg">Candidatos Analisados</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 max-w-7xl">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-50 to-white p-12 text-center">
          <CardContent className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Pronto para revolucionar seu recrutamento?
            </h2>
            <p className="text-xl text-slate-600 mb-10">
              Comece gratuitamente hoje e descubra como a IA pode transformar 
              seu processo seletivo em algo mais rápido, preciso e eficiente.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/auth/signup")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-xl px-10 py-6 text-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Começar Teste Grátis Agora
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="relative">
                <Brain className="h-8 w-8 text-primary" />
                <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RecruitAI
              </span>
            </div>
            <p className="text-sm text-slate-600">
              © 2025 RecruitAI. Recrutamento inteligente com IA avançada.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
