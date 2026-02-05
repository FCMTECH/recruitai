
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Clock, Ban, CheckCircle, AlertTriangle, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { requireSuperAdmin } from '@/lib/admin';

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  trialEndDate: string | null;
  gracePeriodEndDate: string | null;
  gracePeriodDays: number | null;
  suspensionReason: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    companyName: string | null;
  };
  plan: {
    displayName: string;
    price: number;
    jobLimit: number;
    memberLimit: number;
  };
}

interface Stats {
  total: number;
  active: number;
  trial: number;
  past_due: number;
  canceled: number;
  grace_period: number;
  expired: number;
}

export default function AdminSubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  
  // Dialogs
  const [isGraceDialog, setIsGraceDialog] = useState(false);
  const [isSuspendDialog, setIsSuspendDialog] = useState(false);
  const [isReactivateDialog, setIsReactivateDialog] = useState(false);
  const [isCustomPlanDialog, setIsCustomPlanDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form data
  const [graceDays, setGraceDays] = useState('5');
  const [graceReason, setGraceReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  
  // Custom plan form data
  const [customPlanName, setCustomPlanName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customJobLimit, setCustomJobLimit] = useState('');
  const [customMemberLimit, setCustomMemberLimit] = useState('');
  const [customFeatures, setCustomFeatures] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'superadmin') {
        router.push('/dashboard');
      } else {
        loadSubscriptions();
      }
    }
  }, [status, session, router, filter]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/admin/subscriptions'
        : `/api/admin/subscriptions?status=${filter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      toast.error('Erro ao carregar assinaturas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantGracePeriod = async () => {
    if (!selectedSubscription || !graceDays) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${selectedSubscription.id}/grace-period`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: parseInt(graceDays),
          reason: graceReason
        }),
      });

      if (res.ok) {
        toast.success('Período de graça concedido com sucesso!');
        setIsGraceDialog(false);
        setGraceDays('5');
        setGraceReason('');
        loadSubscriptions();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao conceder período de graça');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao conceder período de graça');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedSubscription || !suspendReason) {
      toast.error('Motivo é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${selectedSubscription.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: suspendReason }),
      });

      if (res.ok) {
        toast.success('Assinatura suspensa com sucesso!');
        setIsSuspendDialog(false);
        setSuspendReason('');
        loadSubscriptions();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao suspender assinatura');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao suspender assinatura');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedSubscription) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${selectedSubscription.id}/reactivate`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Assinatura reativada com sucesso!');
        setIsReactivateDialog(false);
        loadSubscriptions();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao reativar assinatura');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao reativar assinatura');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomizePlan = async () => {
    if (!selectedSubscription) return;
    
    if (!customPlanName || !customPrice || !customJobLimit || !customMemberLimit) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${selectedSubscription.id}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: customPlanName,
          price: parseFloat(customPrice),
          jobLimit: parseInt(customJobLimit),
          memberLimit: parseInt(customMemberLimit),
          features: customFeatures,
        }),
      });

      if (res.ok) {
        toast.success('Plano personalizado aplicado com sucesso!');
        setIsCustomPlanDialog(false);
        resetCustomPlanForm();
        loadSubscriptions();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao personalizar plano');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao personalizar plano');
    } finally {
      setIsSaving(false);
    }
  };

  const resetCustomPlanForm = () => {
    setCustomPlanName('');
    setCustomPrice('');
    setCustomJobLimit('');
    setCustomMemberLimit('');
    setCustomFeatures('');
  };

  const openCustomPlanDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    // Pré-preencher com os valores atuais do plano
    setCustomPlanName(subscription.plan.displayName + ' (Personalizado)');
    setCustomPrice(subscription.plan.price.toString());
    setCustomJobLimit(subscription.plan.jobLimit.toString());
    setCustomMemberLimit(subscription.plan.memberLimit.toString());
    setIsCustomPlanDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      active: { variant: 'default', icon: CheckCircle, label: 'Ativo' },
      trial: { variant: 'secondary', icon: Clock, label: 'Trial' },
      grace_period: { variant: 'outline', icon: AlertTriangle, label: 'Período de Graça' },
      past_due: { variant: 'destructive', icon: AlertTriangle, label: 'Pagamento Pendente' },
      canceled: { variant: 'destructive', icon: Ban, label: 'Cancelado' },
      expired: { variant: 'destructive', icon: Ban, label: 'Expirado' },
    };

    const config = variants[status] || variants.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="rounded-lg">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin')}
              className="rounded-xl hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gerenciar Assinaturas
              </h1>
              <p className="text-muted-foreground mt-1">
                Controle total das assinaturas das empresas
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ativo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Trial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.trial}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Graça</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.grace_period}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pendente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.past_due}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cancelado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Expirado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtro */}
        <div className="flex gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="grace_period">Período de Graça</SelectItem>
              <SelectItem value="past_due">Pagamento Pendente</SelectItem>
              <SelectItem value="canceled">Canceladas</SelectItem>
              <SelectItem value="expired">Expiradas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Assinaturas */}
        <div className="grid gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="rounded-2xl hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      {subscription.user.companyName || subscription.user.name || 'Sem nome'}
                    </CardTitle>
                    <CardDescription>
                      {subscription.user.email}
                    </CardDescription>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(subscription.status)}
                      <Badge variant="outline" className="rounded-lg">
                        {subscription.plan.displayName}
                      </Badge>
                      <Badge variant="outline" className="rounded-lg">
                        R$ {subscription.plan.price}/mês
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openCustomPlanDialog(subscription)}
                      className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20"
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Personalizar Plano
                    </Button>
                    {subscription.status !== 'canceled' && subscription.status !== 'expired' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setIsGraceDialog(true);
                          }}
                          className="rounded-xl"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Conceder Graça
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setIsSuspendDialog(true);
                          }}
                          className="rounded-xl"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspender
                        </Button>
                      </>
                    )}
                    {(subscription.status === 'canceled' || subscription.status === 'expired' || subscription.status === 'past_due') && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          setIsReactivateDialog(true);
                        }}
                        className="rounded-xl"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reativar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Vagas</div>
                    <div className="font-medium">{subscription.plan.jobLimit}/mês</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Membros</div>
                    <div className="font-medium">Até {subscription.plan.memberLimit}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Início</div>
                    <div className="font-medium">
                      {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {subscription.trialEndDate && (
                    <div>
                      <div className="text-muted-foreground">Trial até</div>
                      <div className="font-medium">
                        {new Date(subscription.trialEndDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )}
                  {subscription.gracePeriodEndDate && (
                    <div>
                      <div className="text-muted-foreground">Graça até</div>
                      <div className="font-medium text-orange-600">
                        {new Date(subscription.gracePeriodEndDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )}
                  {subscription.suspensionReason && (
                    <div className="col-span-2 md:col-span-4">
                      <div className="text-muted-foreground">Motivo</div>
                      <div className="font-medium text-destructive">{subscription.suspensionReason}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog de Período de Graça */}
      <Dialog open={isGraceDialog} onOpenChange={setIsGraceDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Conceder Período de Graça</DialogTitle>
            <DialogDescription>
              Defina quantos dias de graça serão concedidos para esta empresa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="days">Dias (1-90)</Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="90"
                value={graceDays}
                onChange={(e) => setGraceDays(e.target.value)}
                className="rounded-xl mt-2"
              />
            </div>
            <div>
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                value={graceReason}
                onChange={(e) => setGraceReason(e.target.value)}
                placeholder="Ex: Problema no pagamento"
                className="rounded-xl mt-2"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsGraceDialog(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleGrantGracePeriod} disabled={isSaving} className="rounded-xl">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Conceder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Suspender */}
      <Dialog open={isSuspendDialog} onOpenChange={setIsSuspendDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Suspender Assinatura</DialogTitle>
            <DialogDescription>
              Esta ação bloqueará o acesso da empresa ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="suspendReason">Motivo da Suspensão *</Label>
              <Textarea
                id="suspendReason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Ex: Violação dos termos de uso"
                className="rounded-xl mt-2"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsSuspendDialog(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSuspend} 
              disabled={isSaving}
              className="rounded-xl"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Suspender
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Reativar */}
      <Dialog open={isReactivateDialog} onOpenChange={setIsReactivateDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reativar Assinatura</DialogTitle>
            <DialogDescription>
              Esta ação reativará o acesso da empresa ao sistema por 30 dias
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsReactivateDialog(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleReactivate} disabled={isSaving} className="rounded-xl">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reativar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Personalizar Plano */}
      <Dialog open={isCustomPlanDialog} onOpenChange={(open) => {
        setIsCustomPlanDialog(open);
        if (!open) resetCustomPlanForm();
      }}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Personalizar Plano
            </DialogTitle>
            <DialogDescription>
              {selectedSubscription && (
                <span>
                  Personalize o plano para <strong>{selectedSubscription.user.companyName || selectedSubscription.user.name}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="customPlanName">Nome do Plano *</Label>
              <Input
                id="customPlanName"
                value={customPlanName}
                onChange={(e) => setCustomPlanName(e.target.value)}
                placeholder="Ex: Plano Empresarial Premium"
                className="rounded-xl mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customPrice">Preço Mensal (R$) *</Label>
                <Input
                  id="customPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  className="rounded-xl mt-2"
                />
              </div>
              <div>
                <Label htmlFor="customJobLimit">Limite de Vagas/Mês *</Label>
                <Input
                  id="customJobLimit"
                  type="number"
                  min="1"
                  value={customJobLimit}
                  onChange={(e) => setCustomJobLimit(e.target.value)}
                  placeholder="10"
                  className="rounded-xl mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customMemberLimit">Limite de Membros *</Label>
              <Input
                id="customMemberLimit"
                type="number"
                min="1"
                value={customMemberLimit}
                onChange={(e) => setCustomMemberLimit(e.target.value)}
                placeholder="5"
                className="rounded-xl mt-2"
              />
            </div>
            <div>
              <Label htmlFor="customFeatures">Funcionalidades (separadas por vírgula)</Label>
              <Textarea
                id="customFeatures"
                value={customFeatures}
                onChange={(e) => setCustomFeatures(e.target.value)}
                placeholder="Ex: Análise de IA avançada, Suporte prioritário, Relatórios personalizados"
                className="rounded-xl mt-2"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCustomPlanDialog(false);
                resetCustomPlanForm();
              }} 
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCustomizePlan} 
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aplicar Plano Personalizado
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
