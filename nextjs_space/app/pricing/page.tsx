

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Loader2, Zap, Brain, Crown, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  jobLimit: number;
  features: string[];
  isActive: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  plan: Plan;
}

export default function PricingPage() {
  const session = useSession();
  const router = useRouter();
  const sessionData = session?.data;
  const sessionStatus = session?.status || 'loading';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (sessionData?.user) {
      fetchCurrentSubscription();
    }
  }, [sessionData]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current');
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    }
  };

  const handleSelectPlan = async (planId: string, planName: string) => {
    if (sessionStatus !== 'authenticated') {
      toast.error('Você precisa estar logado para assinar um plano');
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    if (planName === 'personalizado') {
      toast.info('Entre em contato conosco para um plano personalizado');
      return;
    }

    if (planName === 'free') {
      try {
        setCheckoutLoading(planId);
        const response = await fetch('/api/subscriptions/create-trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId })
        });

        if (response.ok) {
          toast.success('Período de teste ativado com sucesso!');
          router.push('/dashboard');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Erro ao ativar período de teste');
        }
      } catch (error) {
        console.error('Erro:', error);
        toast.error('Erro ao ativar período de teste');
      } finally {
        setCheckoutLoading(null);
      }
      return;
    }

    try {
      setCheckoutLoading(planId);
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erro ao criar sessão de checkout');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId && 
           ['trial', 'active'].includes(currentSubscription?.status || '');
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <Zap className="h-6 w-6 text-primary" />;
      case 'bronze':
        return <Sparkles className="h-6 w-6 text-amber-700" />;
      case 'prata':
        return <Brain className="h-6 w-6 text-slate-500" />;
      case 'ouro':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'personalizado':
        return <Sparkles className="h-6 w-6 text-purple-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="flex items-center gap-2 animate-pulse">
          <Brain className="h-8 w-8 text-primary" />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-4">
      {/* Header */}
      <header className="container mx-auto mb-12 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(sessionStatus === 'authenticated' ? '/dashboard' : '/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Brain className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RecruitAI
              </span>
            </Link>
          </div>
          {sessionStatus === 'authenticated' && (
            <Button asChild variant="outline">
              <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Preços Transparentes</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Escolha o Plano Ideal
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Para Sua Empresa
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Simplifique seu processo de recrutamento com IA avançada. 
            Comece com 7 dias grátis e cancele quando quiser.
          </p>
        </div>

        {/* Current Plan Info */}
        {currentSubscription && (
          <div className="mb-12 max-w-2xl mx-auto">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Plano Atual</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {currentSubscription.plan.displayName}
                    </p>
                  </div>
                  <Badge className={
                    currentSubscription.status === 'active' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400' 
                      : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                  }>
                    {currentSubscription.status === 'trial' && 'Período de Teste'}
                    {currentSubscription.status === 'active' && 'Ativo'}
                    {currentSubscription.status === 'past_due' && 'Pagamento Pendente'}
                    {currentSubscription.status === 'canceled' && 'Cancelado'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {plans.filter(p => p.isActive).map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 ${
                plan.name === 'ouro' 
                  ? 'border-yellow-400 shadow-xl shadow-yellow-100' 
                  : 'border-slate-200 hover:border-primary/50'
              } bg-white/80 backdrop-blur`}
            >
              {plan.name === 'ouro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg">
                    Mais Popular
                  </Badge>
                </div>
              )}
              {plan.name === 'free' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                    Teste Grátis
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">{plan.displayName}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.name === 'free' && 'Teste por 7 dias'}
                  {plan.name === 'bronze' && 'Ideal para pequenas empresas'}
                  {plan.name === 'prata' && 'Para empresas em crescimento'}
                  {plan.name === 'ouro' && 'Para grandes volumes'}
                  {plan.name === 'personalizado' && 'Solução sob medida'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  {plan.price > 0 ? (
                    <div>
                      <span className="text-4xl font-bold text-slate-900">
                        R$ {plan.price.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-slate-600 ml-2">/mês</span>
                    </div>
                  ) : plan.name === 'free' ? (
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Grátis</span>
                  ) : (
                    <span className="text-2xl font-bold text-slate-900">Sob consulta</span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 p-1 rounded-full bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.name !== 'free' && plan.name !== 'personalizado' && (
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="font-medium">Até {plan.jobLimit} vagas/mês</span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.name === 'ouro' 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white shadow-lg' 
                      : plan.name === 'free'
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg'
                      : ''
                  }`}
                  variant={plan.name === 'ouro' || plan.name === 'free' ? 'default' : 'outline'}
                  disabled={isCurrentPlan(plan.id) || checkoutLoading === plan.id}
                  onClick={() => handleSelectPlan(plan.id, plan.name)}
                >
                  {checkoutLoading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : isCurrentPlan(plan.id) ? (
                    'Plano Atual'
                  ) : plan.name === 'personalizado' ? (
                    'Entrar em Contato'
                  ) : plan.name === 'free' ? (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Iniciar Teste Grátis
                    </>
                  ) : (
                    'Assinar Agora'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Guarantee Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50 p-8 text-center">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent mb-6">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Garantia de Satisfação
              </h3>
              <p className="text-lg text-slate-600 mb-6">
                Teste gratuitamente por 7 dias. Cancele a qualquer momento, sem taxas ou multas.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Cartão de Crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>PIX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Boleto</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
