"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { Eye, EyeOff, Loader2, User, Building2, Mail, Check, Crown, ArrowLeft, Briefcase, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  jobLimit: number;
  features: string[];
}

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<"candidate" | "company">(
    (searchParams?.get("type") as "candidate" | "company") || "candidate"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    cnpj: "",
    phone: "",
    city: "",
    state: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userType === "company") {
      fetch("/api/plans")
        .then(res => res.json())
        .then(data => {
          setPlans(data);
          const freePlan = data.find((p: Plan) => p.price === 0);
          if (freePlan) setSelectedPlan(freePlan.id);
        })
        .catch(console.error);
    }
  }, [userType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (userType === "company" && !selectedPlan) {
      toast.error("Selecione um plano para continuar");
      return;
    }

    if (userType === "company" && !formData.companyName) {
      toast.error("Preencha o nome da empresa");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
        ...(userType === "company" && {
          companyName: formData.companyName,
          cnpj: formData.cnpj,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          planId: selectedPlan,
        }),
      };

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar conta");
      }

      toast.success("Conta criada com sucesso!");

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push(userType === "candidate" ? "/candidate/dashboard" : "/dashboard");
      } else {
        router.push("/auth/signin");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, {
        callbackUrl: userType === "candidate" ? "/candidate/dashboard" : "/onboarding",
      });
    } catch (error) {
      toast.error("Erro ao conectar. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo href="/" />
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-stone-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pb-8">
        <div className="w-full max-w-lg animate-fade-in">
          <Card className="border-stone-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-stone-900">
                Criar conta
              </CardTitle>
              <CardDescription className="text-stone-500">
                {userType === "candidate" ? "Encontre as melhores oportunidades" : "Encontre os melhores talentos"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Type Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => { setUserType("candidate"); setStep(1); }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                    userType === "candidate" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                  )}
                >
                  <User className="w-4 h-4" />
                  Candidato
                </button>
                <button
                  type="button"
                  onClick={() => { setUserType("company"); setStep(1); }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                    userType === "company" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
                  )}
                >
                  <Building2 className="w-4 h-4" />
                  Empresa
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label className="text-stone-700">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <Input
                          name="name"
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-10 border-stone-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-stone-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <Input
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10 border-stone-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-stone-700">Senha</Label>
                        <div className="relative">
                          <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="pr-10 border-stone-200"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-stone-700">Confirmar</Label>
                        <Input
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="border-stone-200"
                          required
                        />
                      </div>
                    </div>

                    {userType === "company" && (
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full bg-stone-900 hover:bg-stone-800 h-11"
                        disabled={!formData.name || !formData.email || !formData.password}
                      >
                        Continuar
                      </Button>
                    )}

                    {userType === "candidate" && (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-stone-900 hover:bg-stone-800 h-11"
                      >
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</> : "Criar conta"}
                      </Button>
                    )}
                  </div>
                )}

                {/* Step 2: Company Info */}
                {step === 2 && userType === "company" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label className="text-stone-700">Nome da empresa *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <Input
                          name="companyName"
                          placeholder="Nome da empresa"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="pl-10 border-stone-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-stone-700">CNPJ</Label>
                        <Input
                          name="cnpj"
                          placeholder="00.000.000/0000-00"
                          value={formData.cnpj}
                          onChange={handleChange}
                          className="border-stone-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-stone-700">Telefone</Label>
                        <Input
                          name="phone"
                          placeholder="(00) 00000-0000"
                          value={formData.phone}
                          onChange={handleChange}
                          className="border-stone-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-stone-700">Cidade</Label>
                        <Input
                          name="city"
                          placeholder="Cidade"
                          value={formData.city}
                          onChange={handleChange}
                          className="border-stone-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-stone-700">Estado</Label>
                        <Input
                          name="state"
                          placeholder="UF"
                          value={formData.state}
                          onChange={handleChange}
                          className="border-stone-200"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    {/* Plan Selection */}
                    <div className="space-y-3">
                      <Label className="text-stone-700">Selecione um plano</Label>
                      <div className="grid gap-2">
                        {plans.filter(p => p.name !== 'personalizado').map(plan => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSelectedPlan(plan.id)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left",
                              selectedPlan === plan.id
                                ? "border-amber-500 bg-amber-50"
                                : "border-stone-200 hover:border-stone-300"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                selectedPlan === plan.id ? "border-amber-500 bg-amber-500" : "border-stone-300"
                              )}>
                                {selectedPlan === plan.id && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <div>
                                <p className="font-medium text-stone-800">{plan.displayName}</p>
                                <p className="text-xs text-stone-500">{plan.jobLimit} vagas/mês</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {plan.price === 0 ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Grátis</Badge>
                              ) : (
                                <span className="font-semibold text-stone-900">R$ {plan.price}/mês</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading || !formData.companyName}
                        className="flex-1 bg-stone-900 hover:bg-stone-800"
                      >
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</> : "Criar conta"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>

              {/* OAuth for candidates */}
              {userType === "candidate" && step === 1 && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-stone-500">ou continue com</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOAuthSignIn("google")}
                      className="border-stone-200 hover:bg-stone-50"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOAuthSignIn("linkedin")}
                      className="border-stone-200 hover:bg-stone-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </Button>
                  </div>
                </>
              )}

              {/* Sign In Link */}
              <p className="text-center text-sm text-stone-500">
                Já tem uma conta?{" "}
                <Link href="/auth/signin" className="text-amber-600 hover:text-amber-700 font-medium hover:underline">
                  Entrar
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
