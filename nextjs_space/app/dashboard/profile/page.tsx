
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ArrowLeft, Save, Loader2, User, Mail, Building, CreditCard, CheckCircle2, Upload, Image as ImageIcon, Phone, X } from "lucide-react";
import Image from "next/image";
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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    companyName: "",
    tradeName: "",
    cnpj: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    logoUrl: "",
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [showCustomPlanModal, setShowCustomPlanModal] = useState(false);
  const [isSubmittingCustomPlan, setIsSubmittingCustomPlan] = useState(false);
  const [customPlanForm, setCustomPlanForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      if (userRole !== "company") {
        router.push("/dashboard");
        return;
      }

      loadProfile();
      loadSubscription();
      loadAvailablePlans();
    }
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
          tradeName: data.tradeName || "",
          cnpj: data.cnpj || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          logoUrl: data.logoUrl || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/dashboard/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { logoUrl } = await response.json();
        setProfile({ ...profile, logoUrl });
        toast.success("Logo atualizada com sucesso!");
        // Recarregar a sessão para atualizar o logo no header
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao fazer upload da logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Erro ao fazer upload da logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions/current");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription || null);
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

  const handleCnpjSearch = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) {
      toast.error("CNPJ inválido");
      return;
    }

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          companyName: data.razao_social || "",
          tradeName: data.nome_fantasia || "",
          phone: data.ddd_telefone_1 || "",
          address: `${data.logradouro}, ${data.numero} - ${data.bairro}`,
          city: data.municipio || "",
          state: data.uf || "",
        }));
        toast.success("Dados da empresa carregados!");
      } else {
        toast.error("CNPJ não encontrado");
      }
    } catch (error) {
      console.error("Error searching CNPJ:", error);
      toast.error("Erro ao buscar CNPJ");
    }
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email || !profile.companyName) {
      toast.error("Nome, e-mail e razão social são obrigatórios");
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

  const handleChangePlan = async (planId: string, planName: string) => {
    // Se for plano personalizado, abre o modal
    if (planName === "personalizado" || planName === "Personalizado") {
      setCustomPlanForm({
        name: profile.name || profile.companyName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        message: "",
      });
      setShowCustomPlanModal(true);
      return;
    }

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
        const data = await response.json();
        throw new Error(data.message || "Erro ao iniciar checkout");
      }
    } catch (error: any) {
      console.error("Error changing plan:", error);
      toast.error(error.message || "Erro ao alterar plano");
      setIsChangingPlan(false);
    }
  };

  const handleSubmitCustomPlan = async () => {
    if (!customPlanForm.name || !customPlanForm.email || !customPlanForm.phone) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmittingCustomPlan(true);
    try {
      const response = await fetch("/api/custom-plan-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customPlanForm.name,
          email: customPlanForm.email,
          phone: customPlanForm.phone,
          message: customPlanForm.message,
          companyName: profile.companyName,
        }),
      });

      if (response.ok) {
        toast.success("Solicitação enviada com sucesso! Entraremos em contato em breve.");
        setShowCustomPlanModal(false);
        setCustomPlanForm({ name: "", email: "", phone: "", message: "" });
      } else {
        const data = await response.json();
        throw new Error(data.message || "Erro ao enviar solicitação");
      }
    } catch (error: any) {
      console.error("Error submitting custom plan request:", error);
      toast.error(error.message || "Erro ao enviar solicitação");
    } finally {
      setIsSubmittingCustomPlan(false);
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
              <Label htmlFor="cnpj">CNPJ</Label>
              <div className="flex gap-2">
                <Input
                  id="cnpj"
                  value={profile.cnpj}
                  onChange={(e) => setProfile({ ...profile, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCnpjSearch(profile.cnpj)}
                  disabled={isLoading}
                >
                  Buscar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Razão Social *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  value={profile.companyName}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  placeholder="Razão social da empresa"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input
                id="tradeName"
                value={profile.tradeName}
                onChange={(e) => setProfile({ ...profile, tradeName: e.target.value })}
                placeholder="Nome fantasia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Rua, número - bairro"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Logo da Empresa</Label>
              <div className="flex items-center gap-4">
                {/* Preview do Logo */}
                <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted/20">
                  {profile.logoUrl ? (
                    <Image
                      src={profile.logoUrl}
                      alt="Logo da empresa"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Botão de Upload */}
                <div className="flex-1 space-y-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="hidden"
                  />
                  <Label
                    htmlFor="logo"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    {isUploadingLogo ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Escolher Logo
                      </>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPEG, PNG, WebP (máximo 5MB)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        {subscription && subscription.plan && (
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
                    <h3 className="text-lg font-semibold">{subscription.plan?.displayName || "Plano"}</h3>
                    <Badge variant={getStatusBadge(subscription.status).variant}>
                      {getStatusBadge(subscription.status).label}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    R$ {subscription.plan?.price?.toFixed(2) || "0.00"}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Limite: {subscription.plan?.jobLimit || 0} vagas/mês</p>
                    <p>Criadas este mês: {subscription.jobsCreatedThisMonth || 0}</p>
                    {subscription.trialEndDate && (
                      <p>Período de teste até: {new Date(subscription.trialEndDate).toLocaleDateString("pt-BR")}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recursos Incluídos:</h4>
                <ul className="space-y-2">
                  {subscription.plan?.features?.map((feature, index) => (
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
                .filter((plan) => plan.name !== "free" && plan.id !== subscription?.plan?.id)
                .map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.displayName || plan.name}</CardTitle>
                      <div className="text-2xl font-bold text-primary">
                        R$ {plan.price?.toFixed(2) || "0.00"}
                        <span className="text-sm font-normal text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Até {plan.jobLimit || 0} vagas/mês
                      </p>
                      <Button
                        onClick={() => handleChangePlan(plan.id, plan.name)}
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

      {/* Modal de Solicitação de Plano Personalizado */}
      <Dialog open={showCustomPlanModal} onOpenChange={setShowCustomPlanModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Solicitar Plano Personalizado
            </DialogTitle>
            <DialogDescription>
              Preencha seus dados e entraremos em contato para entender melhor suas necessidades.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-name" className="text-sm font-medium">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="custom-name"
                  placeholder="Seu nome completo"
                  value={customPlanForm.name}
                  onChange={(e) => setCustomPlanForm({ ...customPlanForm, name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-email" className="text-sm font-medium">
                E-mail <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="custom-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={customPlanForm.email}
                  onChange={(e) => setCustomPlanForm({ ...customPlanForm, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-phone" className="text-sm font-medium">
                Telefone <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="custom-phone"
                  placeholder="(00) 00000-0000"
                  value={customPlanForm.phone}
                  onChange={(e) => setCustomPlanForm({ ...customPlanForm, phone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-message" className="text-sm font-medium">
                Mensagem (Opcional)
              </Label>
              <Textarea
                id="custom-message"
                placeholder="Conte-nos um pouco sobre suas necessidades..."
                value={customPlanForm.message}
                onChange={(e) => setCustomPlanForm({ ...customPlanForm, message: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCustomPlanModal(false)}
              className="flex-1"
              disabled={isSubmittingCustomPlan}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitCustomPlan}
              disabled={isSubmittingCustomPlan}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              {isSubmittingCustomPlan ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
              ) : (
                "Enviar Solicitação"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
