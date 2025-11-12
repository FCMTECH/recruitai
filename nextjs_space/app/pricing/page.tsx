
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
        setPlans(data.plans);
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
      // Para plano free, criar assinatura diretamente
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

    // Para planos pagos, redirecionar para checkout do Stripe
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

  const getPlanBadge = (planName: string) => {
    if (planName === 'ouro') {
      return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">Mais Popular</Badge>;
    }
    if (planName === 'free') {
      return <Badge variant="outline">Teste Grátis</Badge>;
    }
    return null;
  };

  const getPlanGradient = (planName: string) => {
    switch (planName) {
      case 'free':
        return 'border-gray-300 hover:border-gray-400';
      case 'bronze':
        return 'border-amber-700 hover:border-amber-800 hover:shadow-amber-200/50';
      case 'prata':
        return 'border-gray-400 hover:border-gray-500 hover:shadow-gray-200/50';
      case 'ouro':
        return 'border-yellow-500 hover:border-yellow-600 hover:shadow-yellow-200/50 shadow-lg';
      case 'personalizado':
        return 'border-purple-500 hover:border-purple-600 hover:shadow-purple-200/50';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Sua Empresa
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simplifique seu processo de recrutamento com IA avançada. 
            Comece com 1 semana grátis e cancele quando quiser.
          </p>
        </div>

        {/* Current Plan Info */}
        {currentSubscription && (
          <div className="mb-8 max-w-2xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Plano Atual</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentSubscription.plan.displayName}
                    </p>
                  </div>
                  <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
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
              className={`relative transition-all duration-300 hover:shadow-xl ${getPlanGradient(plan.name)} ${
                plan.name === 'ouro' ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                  {getPlanBadge(plan.name)}
                </div>
                <CardDescription>
                  {plan.name === 'free' && 'Teste por 1 semana'}
                  {plan.name === 'bronze' && 'Ideal para pequenas empresas'}
                  {plan.name === 'prata' && 'Para empresas em crescimento'}
                  {plan.name === 'ouro' && 'Para grandes volumes'}
                  {plan.name === 'personalizado' && 'Solução sob medida'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  {plan.price > 0 ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        R$ {plan.price.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-gray-600 ml-2">/mês</span>
                    </>
                  ) : plan.name === 'free' ? (
                    <span className="text-4xl font-bold text-green-600">Grátis</span>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">Sob consulta</span>
                  )}
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.name !== 'free' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Sparkles className="h-4 w-4" />
                      <span>Até {plan.jobLimit} vagas/mês</span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.name === 'ouro' ? 'default' : 'outline'}
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
                    'Iniciar Teste Grátis'
                  ) : (
                    'Assinar Plano'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ ou Garantias */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Garantia de Satisfação
          </h3>
          <p className="text-gray-600 mb-8">
            Teste gratuitamente por 1 semana. Cancele a qualquer momento, sem taxas ou multas. 
            Aceitamos cartão de crédito, débito, PIX e boleto bancário.
          </p>
        </div>
      </div>
    </div>
  );
}
