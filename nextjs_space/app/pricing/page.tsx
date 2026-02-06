
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Sparkles, Loader2, Zap, Crown, ArrowLeft, Mail, Phone, User } from 'lucide-react';
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
  
  // Custom plan request states
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

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

  const handleSelectPlan = async (e: React.MouseEvent, planId: string, planName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (planName === 'personalizado') {
      // Preencher dados do usuário logado se disponível
      if (sessionData?.user) {
        setContactFormData({
          name: sessionData.user.name || '',
          email: sessionData.user.email || '',
          phone: '',
          message: '',
        });
      }
      setShowContactDialog(true);
      return;
    }

    if (sessionStatus !== 'authenticated') {
      toast.error('Você precisa estar logado para assinar um plano');
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    // Verificar se é o email de teste
    const isTestEmail = sessionData?.user?.email === 'teste@fcmtech.com.br';

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
      
      // Se for email de teste, usar rota especial
      if (isTestEmail) {
        const response = await fetch('/api/checkout/test-mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId })
        });

        if (response.ok) {
          const data = await response.json();
          toast.success('Plano ativado em modo de teste! ✅');
          router.push('/dashboard');
          return;
        } else {
          const error = await response.json();
          toast.error(error.message || 'Erro ao ativar plano de teste');
        }
      } else {
        // Fluxo normal com Stripe
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
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!contactFormData.name || !contactFormData.email || !contactFormData.phone) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactFormData.email)) {
      toast.error('Por favor, insira um e-mail válido');
      return;
    }

    setIsSubmittingContact(true);

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('/api/custom-plan-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactFormData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Erro ao enviar solicitação. Tente novamente.');
        return;
      }

      const data = await response.json();
      
      toast.success(data.message || 'Solicitação enviada com sucesso!');
      setShowContactDialog(false);
      setContactFormData({ name: '', email: '', phone: '', message: '' });
      
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error);
      
      if (error.name === 'AbortError') {
        toast.error('A solicitação demorou muito. Por favor, tente novamente.');
      } else if (error.message?.includes('Failed to fetch')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        toast.error('Erro ao enviar solicitação. Por favor, tente novamente.');
      }
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId && 
           ['trial', 'active'].includes(currentSubscription?.status || '');
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <Zap className="h-5 w-5 text-stone-600" />;
      case 'bronze':
        return <Sparkles className="h-5 w-5 text-amber-700" />;
      case 'prata':
        return <Sparkles className="h-5 w-5 text-slate-500" />;
      case 'ouro':
        return <Crown className="h-5 w-5 text-amber-500" />;
      case 'personalizado':
        return <Sparkles className="h-5 w-5 text-stone-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex items-center gap-3 animate-pulse">
          <svg className="h-8 w-8 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <Loader2 className="h-6 w-6 animate-spin text-stone-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5 max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(sessionStatus === 'authenticated' ? '/dashboard' : '/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <svg className="h-7 w-7 text-stone-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-lg font-bold text-stone-900">RecruitAI</span>
            </Link>
          </div>
          {sessionStatus === 'authenticated' && (
            <Button asChild variant="outline" className="border-stone-300">
              <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up">
          <p className="text-amber-700 text-sm tracking-widest uppercase mb-4 font-medium">
            Preços Transparentes
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6">
            Escolha o Plano Ideal Para Sua Empresa
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Simplifique seu processo de recrutamento com IA avançada. 
            Comece com 7 dias grátis e cancele quando quiser.
          </p>
        </div>

        {/* Current Plan Info */}
        {currentSubscription && (
          <div className="mb-12 max-w-2xl mx-auto">
            <Card className="bg-white border-stone-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-500 font-medium">Plano Atual</p>
                    <p className="text-xl font-serif text-stone-900">
                      {currentSubscription.plan.displayName}
                    </p>
                  </div>
                  <Badge className={
                    currentSubscription.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border-amber-200'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-12">
          {plans.filter((p: any) => p.isActive).map((plan: any) => (
            <Card
              key={plan.id}
              className={`relative bg-white border transition-all duration-300 hover:shadow-lg ${
                plan.name === 'ouro' 
                  ? 'border-amber-400 shadow-md' 
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {plan.name === 'ouro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-600 text-white">
                    Mais Popular
                  </Badge>
                </div>
              )}
              {plan.name === 'free' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-stone-900 text-white">
                    Teste Grátis
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-3 pb-3">
                <div className="inline-flex p-2 rounded-lg bg-stone-100 w-fit">
                  {getPlanIcon(plan.name)}
                </div>
                <CardTitle className="font-serif text-xl text-stone-900">{plan.displayName}</CardTitle>
                <CardDescription className="text-xs text-stone-500">
                  {plan.name === 'free' && 'Teste por 7 dias'}
                  {plan.name === 'bronze' && 'Pequenas empresas'}
                  {plan.name === 'prata' && 'Empresas em crescimento'}
                  {plan.name === 'ouro' && 'Grandes volumes'}
                  {plan.name === 'personalizado' && 'Solução sob medida'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="mb-4">
                  {plan.price > 0 ? (
                    <div>
                      <span className="font-serif text-3xl text-stone-900">
                        R$ {plan.price.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-stone-500 text-sm">/mês</span>
                    </div>
                  ) : plan.name === 'free' ? (
                    <span className="font-serif text-3xl text-amber-600">Grátis</span>
                  ) : (
                    <span className="font-serif text-xl text-stone-700">Sob consulta</span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {plan.features.slice(0, 4).map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-stone-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.name !== 'free' && plan.name !== 'personalizado' && (
                  <div className="pt-3 border-t border-stone-100">
                    <div className="text-xs text-stone-500">
                      Até <span className="font-semibold text-stone-700">{plan.jobLimit}</span> vagas/mês
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  className={`w-full ${
                    plan.name === 'ouro' 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : plan.name === 'free'
                      ? 'bg-stone-900 hover:bg-stone-800 text-white'
                      : 'border-stone-300 hover:bg-stone-50'
                  }`}
                  variant={plan.name === 'ouro' || plan.name === 'free' ? 'default' : 'outline'}
                  disabled={isCurrentPlan(plan.id) || checkoutLoading === plan.id}
                  onClick={(e) => handleSelectPlan(e, plan.id, plan.name)}
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
                    'Assinar Agora'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Guarantee Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-stone-950 rounded-xl p-10 text-center">
            <h3 className="font-serif text-2xl text-white mb-4">
              Garantia de Satisfação
            </h3>
            <p className="text-stone-400 mb-6">
              Teste gratuitamente por 7 dias. Cancele a qualquer momento, sem taxas ou multas.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-stone-300">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                <span>Cartão de Crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                <span>PIX</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                <span>Boleto</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Dialog for Custom Plan */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-stone-900">
              Solicitar Plano Personalizado
            </DialogTitle>
            <DialogDescription className="text-stone-500">
              Preencha seus dados e entraremos em contato para entender melhor suas necessidades.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitContactForm} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-stone-700">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={contactFormData.name}
                  onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                  className="pl-10 border-stone-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-700">
                E-mail <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={contactFormData.email}
                  onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                  className="pl-10 border-stone-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-stone-700">
                Telefone <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={contactFormData.phone}
                  onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                  className="pl-10 border-stone-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-stone-700">
                Mensagem (Opcional)
              </Label>
              <Textarea
                id="message"
                placeholder="Conte-nos um pouco sobre suas necessidades..."
                value={contactFormData.message}
                onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                rows={4}
                className="border-stone-200"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowContactDialog(false)}
                className="flex-1 border-stone-300"
                disabled={isSubmittingContact}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white"
                disabled={isSubmittingContact}
              >
                {isSubmittingContact ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitação'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
