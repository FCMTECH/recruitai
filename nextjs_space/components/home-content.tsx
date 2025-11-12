
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, FileText, BarChart3 } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">ATS Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/pricing")}
            >
              Planos
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/signin")}
            >
              Entrar
            </Button>
            <Button
              onClick={() => router.push("/auth/signup")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Cadastrar Empresa
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Recrutamento Inteligente com{" "}
            <span className="text-blue-600">Inteligência Artificial</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Revolucione seu processo de recrutamento com análise automática de currículos,
            scoring inteligente e insights precisos para encontrar os melhores talentos.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button
              size="lg"
              onClick={() => router.push("/auth/signup")}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              Começar Gratuitamente
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/apply")}
              className="px-8 py-3"
            >
              Enviar Currículo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Como Funciona Nossa Plataforma
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Cadastro de Vagas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Configure vagas com critérios específicos e pesos personalizáveis
                para cada requisito.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Upload Simples</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Candidatos enviam currículos sem criar conta, apenas com dados
                básicos de contato.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Análise de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Engine avançada extrai informações e calcula compatibilidade
                automática com explicações detalhadas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Dashboard Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Visualize resultados, filtre candidatos e tome decisões
                informadas com insights da IA.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-6">
            Pronto para Revolucionar seu Recrutamento?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Junte-se às empresas que já usam IA para encontrar os melhores talentos
            de forma mais rápida e precisa.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push("/auth/signup")}
            className="px-8 py-3"
          >
            Cadastrar Empresa Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center max-w-6xl">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold">ATS Platform</span>
          </div>
          <p className="text-sm text-gray-400">
            Recrutamento inteligente com análise automática de currículos usando IA avançada.
          </p>
        </div>
      </footer>
    </div>
  );
}
