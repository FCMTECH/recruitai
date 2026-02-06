"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSent(true);
        toast.success("Email enviado com sucesso!");
      } else {
        const data = await response.json();
        toast.error(data.message || "Erro ao enviar email");
      }
    } catch (error) {
      toast.error("Erro ao enviar email");
    } finally {
      setIsLoading(false);
    }
  };

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
                {emailSent ? "Email enviado!" : "Esqueceu a senha?"}
              </CardTitle>
              <CardDescription className="text-stone-500">
                {emailSent
                  ? "Verifique sua caixa de entrada"
                  : "Digite seu email para recuperar a senha"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {emailSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-sm text-stone-600">
                    Enviamos um link para <strong>{email}</strong>. Clique no link para redefinir sua senha.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    Enviar novamente
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-stone-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-stone-200"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-stone-900 hover:bg-stone-800 h-11"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                    ) : (
                      "Enviar link de recuperação"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
