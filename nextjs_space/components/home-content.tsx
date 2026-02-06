"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Target, Zap, TrendingUp, Shield, Cpu, Users, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HomeContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      if (userRole === "candidate") {
        router.push("/candidate/dashboard");
      } else if (userRole === "company") {
        router.push("/dashboard");
      } else if (userRole === "superadmin") {
        router.push("/admin");
      }
    }
  }, [session, status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-pulse">
          <Logo size="lg" showText={false} href="#" />
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Cpu,
      title: "Análise com IA",
      description: "Algoritmos inteligentes avaliam candidatos automaticamente",
    },
    {
      icon: Target,
      title: "Match Inteligente",
      description: "Encontre os candidatos ideais para cada vaga",
    },
    {
      icon: TrendingUp,
      title: "Dashboard Avançado",
      description: "Acompanhe métricas e resultados em tempo real",
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta",
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/" />
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/pricing" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Planos
              </Link>
              <Link href="/vagas" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Vagas
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-stone-600 hover:text-stone-900">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-stone-900 hover:bg-stone-800 text-white">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Recrutamento Inteligente com IA
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight mb-6">
              Encontre os melhores{" "}
              <span className="text-amber-600">talentos</span>
              {" "}para sua equipe
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
              Plataforma completa de recrutamento e seleção com inteligência artificial para agilizar suas contratações.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup?type=company">
                <Button size="lg" className="bg-stone-900 hover:bg-stone-800 text-white px-8 h-12 text-base">
                  Iniciar Teste Grátis
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/vagas">
                <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 px-8 h-12 text-base">
                  <Users className="w-4 h-4 mr-2" />
                  Sou Candidato
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-200/20 to-stone-200/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
      </div>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">
              Por que escolher o RecruitAI?
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Ferramentas poderosas para transformar seu processo de recrutamento
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-stone-200 bg-white hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                    <feature.icon className="w-6 h-6 text-stone-600 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-stone-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-950 rounded-2xl p-8 sm:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-amber-500">500+</p>
                <p className="text-sm text-stone-400 mt-1">Empresas</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-amber-500">10k+</p>
                <p className="text-sm text-stone-400 mt-1">Candidatos</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-amber-500">98%</p>
                <p className="text-sm text-stone-400 mt-1">Satisfação</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-amber-500">50%</p>
                <p className="text-sm text-stone-400 mt-1">Menos Tempo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-stone-600 mb-8 max-w-xl mx-auto">
            Junte-se a centenas de empresas que já transformaram seu recrutamento.
          </p>
          <Link href="/auth/signup?type=company">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 h-12">
              Criar conta grátis
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <Link href="/pricing" className="hover:text-stone-900 transition-colors">Planos</Link>
              <Link href="/vagas" className="hover:text-stone-900 transition-colors">Vagas</Link>
            </div>
            <p className="text-sm text-stone-400">
              © 2024 RecruitAI. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
