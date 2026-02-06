"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Senha redefinida com sucesso!");
      } else {
        const data = await response.json();
        toast.error(data.message || "Erro ao redefinir senha");
      }
    } catch (error) {
      toast.error("Erro ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-stone-600">Link inválido ou expirado.</p>
        <Link href="/auth/forgot-password">
          <Button variant="outline">Solicitar novo link</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="text-sm text-stone-600">Sua senha foi redefinida com sucesso!</p>
        <Link href="/auth/signin">
          <Button className="w-full bg-stone-900 hover:bg-stone-800">Fazer login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-stone-700">Nova senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <Label htmlFor="confirmPassword" className="text-stone-700">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border-stone-200"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-stone-900 hover:bg-stone-800 h-11"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redefinindo...</>
        ) : (
          "Redefinir senha"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo href="/" />
          <Link href="/auth/signin">
            <Button variant="ghost" size="sm" className="text-stone-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="border-stone-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-stone-900">
                Redefinir senha
              </CardTitle>
              <CardDescription className="text-stone-500">
                Digite sua nova senha
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Suspense fallback={<div className="text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
                <ResetPasswordContent />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
