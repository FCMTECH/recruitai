
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Zap, TrendingUp, Sparkles, Shield, Cpu } from "lucide-react";

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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex items-center gap-2 animate-pulse">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-lg font-serif text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            {/* Logo minimalista */}
            <svg className="h-7 w-7 text-stone-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <nav className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/pricing")}
              className="text-stone-700 hover:text-stone-900 font-medium"
            >
              Planos
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/signin")}
              className="text-stone-700 hover:text-stone-900 font-medium"
            >
              Entrar
            </Button>
            <Button
              onClick={() => router.push("/auth/signup")}
              className="bg-stone-900 text-white hover:bg-stone-800 px-6 rounded-md"
            >
              COMEÇAR AGORA
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-16 max-w-5xl">
        <div className="text-center animate-slide-up">
          <p className="text-amber-700 text-sm tracking-widest uppercase mb-6 font-medium">
            Recrutamento Inteligente e Preciso
          </p>
          
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-8 leading-tight">
            Transforme seu processo seletivo com análise automática de currículos,{" "}
            <em className="text-amber-600">scoring</em>{" "}
            inteligente e insights precisos para encontrar os melhores talentos.
          </h1>
          
          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              onClick={() => router.push("/auth/signup")}
              className="bg-stone-900 text-white hover:bg-stone-800 px-8 py-6 text-base font-medium rounded-md"
            >
              INICIAR TESTE GRÁTIS
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/apply")}
              className="border-stone-400 text-stone-700 hover:bg-stone-50 px-8 py-6 text-base font-medium rounded-md"
            >
              ENVIAR CURRÍCULO
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-amber-700 text-sm">
            <Zap className="h-4 w-4" />
            <span>7 dias grátis • Sem cartão de crédito • Cancele quando quiser</span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-4xl px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">
            Tudo que você precisa em uma plataforma
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Funcionalidades poderosas para otimizar cada etapa do seu processo de recrutamento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "Análise de Precisão",
              description: "IA avançada analisa currículos e calcula compatibilidade automática com explicações detalhadas."
            },
            {
              icon: Zap,
              title: "Velocidade Real",
              description: "Análise completa de currículos em segundos, economizando horas do seu time de RH."
            },
            {
              icon: TrendingUp,
              title: "Scoring Inteligente",
              description: "Sistema de pontuação baseado nos critérios específicos de cada vaga com pesos personalizáveis."
            },
            {
              icon: Cpu,
              title: "Insights Profundos",
              description: "Visualize padrões, tendências e métricas detalhadas sobre candidatos e processos."
            },
            {
              icon: Shield,
              title: "Segurança Total",
              description: "Segurança de dados com criptografia e conformidade total com LGPD."
            },
            {
              icon: Sparkles,
              title: "Interface Intuitiva",
              description: "Design moderno e fácil de usar, sem necessidade de treinamento complexo."
            }
          ].map((feature, index) => (
            <Card 
              key={index} 
              className="bg-white border-stone-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="inline-flex p-2 rounded-lg bg-stone-100 mb-4">
                  <feature.icon className="h-5 w-5 text-stone-700" />
                </div>
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-stone-950 rounded-xl p-10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="font-serif text-5xl text-amber-500 italic mb-2">98%</div>
                <div className="text-stone-400 text-sm">Precisão na Análise</div>
              </div>
              <div>
                <div className="font-serif text-5xl text-amber-500 italic mb-2">10X</div>
                <div className="text-stone-400 text-sm">Mais Rápido</div>
              </div>
              <div>
                <div className="font-serif text-5xl text-amber-500 italic mb-2">500+</div>
                <div className="text-stone-400 text-sm">Candidatos Analisados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Logo e descrição */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold tracking-tight text-stone-900">RECRUIT.AI</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Redefinindo os padrões de recrutamento global através de inteligência artificial ética e design centrado no humano.
              </p>
            </div>

            {/* Plataforma */}
            <div>
              <h4 className="text-xs font-semibold text-stone-900 tracking-wider uppercase mb-4">Plataforma</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => router.push("/pricing")} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                    Inteligência
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/auth/signup")} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                    Workflow
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push("/pricing")} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                    Analytics
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold text-stone-900 tracking-wider uppercase mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-stone-500">Privacidade</span>
                </li>
                <li>
                  <span className="text-sm text-stone-500">Termos</span>
                </li>
                <li>
                  <span className="text-sm text-stone-500">Compliance</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-stone-200">
            <p className="text-xs text-stone-400">
              © 2026 RecruitAI Inc. São Paulo, Brasil.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
